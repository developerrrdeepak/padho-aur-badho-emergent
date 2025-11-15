from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    picture: Optional[str] = None
    password_hash: Optional[str] = None
    role: str = "student"  # student, instructor, admin
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str
    language: str
    instructor_id: str
    instructor_name: Optional[str] = None
    thumbnail: Optional[str] = None
    intro_video: Optional[str] = None
    syllabus: Optional[str] = None
    price: float = 0.0
    rating: float = 0.0
    total_ratings: int = 0
    level: str = "beginner"  # beginner, intermediate, advanced
    duration: str = "4 weeks"
    tags: List[str] = []
    prerequisites: List[str] = []
    total_enrollments: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Lesson(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    course_id: str
    title: str
    description: str
    video_url: Optional[str] = None
    order: int
    duration: str = "10 min"
    resources: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StudyMaterial(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    file_url: str
    category: str
    tags: List[str] = []
    chapter: Optional[str] = None
    uploaded_by: str
    preview_available: bool = False
    downloads: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Quiz(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    course_id: Optional[str] = None
    title: str
    duration: int = 30  # minutes
    total_marks: int = 100
    negative_marking: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Question(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    quiz_id: str
    question_text: str
    type: str = "mcq"  # mcq, true_false, fill_blank
    options: List[str] = []
    correct_answer: str
    marks: int = 1

class QuizResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    quiz_id: str
    score: float
    answers: Dict[str, str] = {}
    completed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Enrollment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    course_id: str
    progress: float = 0.0  # percentage
    last_watched_lesson_id: Optional[str] = None
    enrolled_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    course_id: str
    user_id: str
    user_name: Optional[str] = None
    rating: float
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Certificate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    course_id: str
    course_title: Optional[str] = None
    issued_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    certificate_url: Optional[str] = None

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: float
    type: str = "course"  # course, subscription
    status: str = "completed"  # completed, pending, failed
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    author_id: str
    author_name: Optional[str] = None
    tags: List[str] = []
    published_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== REQUEST MODELS ====================

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: str = "student"

class LoginRequest(BaseModel):
    email: str
    password: str

class CourseCreate(BaseModel):
    title: str
    description: str
    category: str
    language: str
    thumbnail: Optional[str] = None
    intro_video: Optional[str] = None
    syllabus: Optional[str] = None
    price: float = 0.0
    level: str = "beginner"
    duration: str = "4 weeks"
    tags: List[str] = []
    prerequisites: List[str] = []

class LessonCreate(BaseModel):
    course_id: str
    title: str
    description: str
    video_url: Optional[str] = None
    order: int
    duration: str = "10 min"
    resources: List[str] = []

class StudyMaterialCreate(BaseModel):
    title: str
    file_url: str
    category: str
    tags: List[str] = []
    chapter: Optional[str] = None
    preview_available: bool = False

class QuizCreate(BaseModel):
    course_id: Optional[str] = None
    title: str
    duration: int = 30
    total_marks: int = 100
    negative_marking: bool = False

class QuestionCreate(BaseModel):
    quiz_id: str
    question_text: str
    type: str = "mcq"
    options: List[str] = []
    correct_answer: str
    marks: int = 1

class QuizSubmission(BaseModel):
    quiz_id: str
    answers: Dict[str, str]

class ReviewCreate(BaseModel):
    course_id: str
    rating: float
    comment: str

class BlogPostCreate(BaseModel):
    title: str
    content: str
    tags: List[str] = []

class AIRecommendationRequest(BaseModel):
    user_interests: List[str] = []
    completed_courses: List[str] = []

class AIChatRequest(BaseModel):
    message: str
    context: Optional[str] = None

class AIQuizGenerateRequest(BaseModel):
    content: str
    num_questions: int = 5

# ==================== AUTH HELPERS ====================

async def get_current_user(request: Request, authorization: Optional[str] = Header(None)) -> Optional[User]:
    # Try cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token and authorization:
        if authorization.startswith("Bearer "):
            session_token = authorization.replace("Bearer ", "")
    
    if not session_token:
        return None
    
    # Check session
    session = await db.user_sessions.find_one({"session_token": session_token})
    if not session:
        return None
    
    # Check expiry
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    # Get user
    user_doc = await db.users.find_one({"id": session["user_id"]}, {"_id": 0})
    if not user_doc:
        return None
    
    return User(**user_doc)

async def require_auth(request: Request, authorization: Optional[str] = Header(None)) -> User:
    user = await get_current_user(request, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user

async def require_role(roles: List[str]):
    async def role_checker(user: User = Depends(require_auth)):
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
    return role_checker

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(req: RegisterRequest):
    # Check if user exists
    existing = await db.users.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    password_hash = bcrypt.hashpw(req.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create user
    user = User(
        email=req.email,
        name=req.name,
        password_hash=password_hash,
        role=req.role
    )
    
    user_doc = user.model_dump()
    user_doc["created_at"] = user_doc["created_at"].isoformat()
    await db.users.insert_one(user_doc)
    
    return {"message": "User registered successfully", "user_id": user.id}

@api_router.post("/auth/login")
async def login(req: LoginRequest, response: Response):
    # Find user
    user_doc = await db.users.find_one({"email": req.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not user_doc.get("password_hash"):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(req.password.encode('utf-8'), user_doc["password_hash"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create session
    session_token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session = UserSession(
        user_id=user_doc["id"],
        session_token=session_token,
        expires_at=expires_at
    )
    
    session_doc = session.model_dump()
    session_doc["expires_at"] = session_doc["expires_at"].isoformat()
    session_doc["created_at"] = session_doc["created_at"].isoformat()
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60,
        path="/"
    )
    
    user = User(**user_doc)
    return {
        "message": "Login successful",
        "user": user.model_dump(exclude={"password_hash"}),
        "session_token": session_token
    }

@api_router.get("/auth/google")
async def google_auth_callback(session_id: str, response: Response):
    # Call Emergent auth API
    import aiohttp
    async with aiohttp.ClientSession() as session:
        async with session.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        ) as resp:
            if resp.status != 200:
                raise HTTPException(status_code=400, detail="Invalid session")
            data = await resp.json()
    
    # Check if user exists
    user_doc = await db.users.find_one({"email": data["email"]}, {"_id": 0})
    
    if not user_doc:
        # Create new user
        user = User(
            email=data["email"],
            name=data["name"],
            picture=data.get("picture"),
            role="student"
        )
        user_doc = user.model_dump()
        user_doc["created_at"] = user_doc["created_at"].isoformat()
        await db.users.insert_one(user_doc)
    
    # Create session
    session_token = data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session = UserSession(
        user_id=user_doc["id"],
        session_token=session_token,
        expires_at=expires_at
    )
    
    session_doc = session.model_dump()
    session_doc["expires_at"] = session_doc["expires_at"].isoformat()
    session_doc["created_at"] = session_doc["created_at"].isoformat()
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60,
        path="/"
    )
    
    return {
        "message": "Login successful",
        "user": User(**user_doc).model_dump(exclude={"password_hash"}),
        "session_token": session_token
    }

@api_router.get("/auth/me")
async def get_me(user: User = Depends(require_auth)):
    return user.model_dump(exclude={"password_hash"})

@api_router.post("/auth/logout")
async def logout(response: Response, user: User = Depends(require_auth), request: Request = None):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out successfully"}

# ==================== COURSE ROUTES ====================

@api_router.get("/courses", response_model=List[Course])
async def get_courses(
    category: Optional[str] = None,
    level: Optional[str] = None,
    language: Optional[str] = None,
    search: Optional[str] = None
):
    query = {}
    if category:
        query["category"] = category
    if level:
        query["level"] = level
    if language:
        query["language"] = language
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    courses = await db.courses.find(query, {"_id": 0}).to_list(1000)
    return courses

@api_router.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: str):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@api_router.post("/courses", response_model=Course)
async def create_course(req: CourseCreate, user: User = Depends(require_role(["instructor", "admin"]))):
    course = Course(
        **req.model_dump(),
        instructor_id=user.id,
        instructor_name=user.name
    )
    
    course_doc = course.model_dump()
    course_doc["created_at"] = course_doc["created_at"].isoformat()
    await db.courses.insert_one(course_doc)
    
    return course

@api_router.put("/courses/{course_id}")
async def update_course(course_id: str, req: CourseCreate, user: User = Depends(require_role(["instructor", "admin"]))):
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if user.role == "instructor" and course["instructor_id"] != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.courses.update_one(
        {"id": course_id},
        {"$set": req.model_dump()}
    )
    
    return {"message": "Course updated successfully"}

@api_router.delete("/courses/{course_id}")
async def delete_course(course_id: str, user: User = Depends(require_role(["instructor", "admin"]))):
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if user.role == "instructor" and course["instructor_id"] != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.courses.delete_one({"id": course_id})
    return {"message": "Course deleted successfully"}

# ==================== ENROLLMENT ROUTES ====================

@api_router.post("/enrollments")
async def enroll_course(course_id: str, user: User = Depends(require_auth)):
    # Check if already enrolled
    existing = await db.enrollments.find_one({"user_id": user.id, "course_id": course_id})
    if existing:
        return {"message": "Already enrolled"}
    
    enrollment = Enrollment(user_id=user.id, course_id=course_id)
    enrollment_doc = enrollment.model_dump()
    enrollment_doc["enrolled_at"] = enrollment_doc["enrolled_at"].isoformat()
    await db.enrollments.insert_one(enrollment_doc)
    
    # Update course enrollment count
    await db.courses.update_one(
        {"id": course_id},
        {"$inc": {"total_enrollments": 1}}
    )
    
    return {"message": "Enrolled successfully", "enrollment_id": enrollment.id}

@api_router.get("/enrollments/my", response_model=List[Enrollment])
async def get_my_enrollments(user: User = Depends(require_auth)):
    enrollments = await db.enrollments.find({"user_id": user.id}, {"_id": 0}).to_list(1000)
    return enrollments

@api_router.put("/enrollments/{enrollment_id}/progress")
async def update_progress(enrollment_id: str, progress: float, lesson_id: Optional[str] = None, user: User = Depends(require_auth)):
    enrollment = await db.enrollments.find_one({"id": enrollment_id, "user_id": user.id})
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    
    update_data = {"progress": progress}
    if lesson_id:
        update_data["last_watched_lesson_id"] = lesson_id
    
    await db.enrollments.update_one(
        {"id": enrollment_id},
        {"$set": update_data}
    )
    
    return {"message": "Progress updated"}

# ==================== LESSON ROUTES ====================

@api_router.get("/lessons", response_model=List[Lesson])
async def get_lessons(course_id: str):
    lessons = await db.lessons.find({"course_id": course_id}, {"_id": 0}).sort("order", 1).to_list(1000)
    return lessons

@api_router.post("/lessons", response_model=Lesson)
async def create_lesson(req: LessonCreate, user: User = Depends(require_role(["instructor", "admin"]))):
    # Check course ownership
    course = await db.courses.find_one({"id": req.course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if user.role == "instructor" and course["instructor_id"] != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    lesson = Lesson(**req.model_dump())
    lesson_doc = lesson.model_dump()
    lesson_doc["created_at"] = lesson_doc["created_at"].isoformat()
    await db.lessons.insert_one(lesson_doc)
    
    return lesson

# ==================== STUDY MATERIAL ROUTES ====================

@api_router.get("/study-materials", response_model=List[StudyMaterial])
async def get_study_materials(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}}
        ]
    
    materials = await db.study_materials.find(query, {"_id": 0}).to_list(1000)
    return materials

@api_router.post("/study-materials", response_model=StudyMaterial)
async def upload_study_material(req: StudyMaterialCreate, user: User = Depends(require_role(["instructor", "admin"]))):
    material = StudyMaterial(**req.model_dump(), uploaded_by=user.id)
    material_doc = material.model_dump()
    material_doc["created_at"] = material_doc["created_at"].isoformat()
    await db.study_materials.insert_one(material_doc)
    
    return material

@api_router.get("/study-materials/{material_id}")
async def download_material(material_id: str, user: User = Depends(require_auth)):
    material = await db.study_materials.find_one({"id": material_id}, {"_id": 0})
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    # Increment download count
    await db.study_materials.update_one(
        {"id": material_id},
        {"$inc": {"downloads": 1}}
    )
    
    return material

# ==================== QUIZ ROUTES ====================

@api_router.get("/quizzes", response_model=List[Quiz])
async def get_quizzes(course_id: Optional[str] = None):
    query = {}
    if course_id:
        query["course_id"] = course_id
    
    quizzes = await db.quizzes.find(query, {"_id": 0}).to_list(1000)
    return quizzes

@api_router.post("/quizzes", response_model=Quiz)
async def create_quiz(req: QuizCreate, user: User = Depends(require_role(["instructor", "admin"]))):
    quiz = Quiz(**req.model_dump())
    quiz_doc = quiz.model_dump()
    quiz_doc["created_at"] = quiz_doc["created_at"].isoformat()
    await db.quizzes.insert_one(quiz_doc)
    
    return quiz

@api_router.post("/questions", response_model=Question)
async def create_question(req: QuestionCreate, user: User = Depends(require_role(["instructor", "admin"]))):
    question = Question(**req.model_dump())
    await db.questions.insert_one(question.model_dump())
    return question

@api_router.get("/quizzes/{quiz_id}/questions", response_model=List[Question])
async def get_quiz_questions(quiz_id: str, user: User = Depends(require_auth)):
    questions = await db.questions.find({"quiz_id": quiz_id}, {"_id": 0, "correct_answer": 0}).to_list(1000)
    return questions

@api_router.post("/quizzes/submit")
async def submit_quiz(req: QuizSubmission, user: User = Depends(require_auth)):
    # Get all questions
    questions = await db.questions.find({"quiz_id": req.quiz_id}, {"_id": 0}).to_list(1000)
    
    # Calculate score
    total_marks = 0
    earned_marks = 0
    
    for question in questions:
        total_marks += question["marks"]
        if req.answers.get(question["id"]) == question["correct_answer"]:
            earned_marks += question["marks"]
    
    score = (earned_marks / total_marks * 100) if total_marks > 0 else 0
    
    # Save result
    result = QuizResult(
        user_id=user.id,
        quiz_id=req.quiz_id,
        score=score,
        answers=req.answers
    )
    
    result_doc = result.model_dump()
    result_doc["completed_at"] = result_doc["completed_at"].isoformat()
    await db.quiz_results.insert_one(result_doc)
    
    return {
        "score": score,
        "earned_marks": earned_marks,
        "total_marks": total_marks,
        "result_id": result.id
    }

@api_router.get("/quizzes/{quiz_id}/leaderboard")
async def get_leaderboard(quiz_id: str, limit: int = 10):
    results = await db.quiz_results.find({"quiz_id": quiz_id}, {"_id": 0}).sort("score", -1).limit(limit).to_list(limit)
    
    # Enrich with user names
    for result in results:
        user = await db.users.find_one({"id": result["user_id"]}, {"_id": 0, "name": 1})
        result["user_name"] = user["name"] if user else "Unknown"
    
    return results

# ==================== REVIEW ROUTES ====================

@api_router.post("/reviews", response_model=Review)
async def create_review(req: ReviewCreate, user: User = Depends(require_auth)):
    # Check if already reviewed
    existing = await db.reviews.find_one({"course_id": req.course_id, "user_id": user.id})
    if existing:
        raise HTTPException(status_code=400, detail="Already reviewed")
    
    review = Review(**req.model_dump(), user_id=user.id, user_name=user.name)
    review_doc = review.model_dump()
    review_doc["created_at"] = review_doc["created_at"].isoformat()
    await db.reviews.insert_one(review_doc)
    
    # Update course rating
    all_reviews = await db.reviews.find({"course_id": req.course_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r["rating"] for r in all_reviews) / len(all_reviews)
    
    await db.courses.update_one(
        {"id": req.course_id},
        {"$set": {"rating": avg_rating, "total_ratings": len(all_reviews)}}
    )
    
    return review

@api_router.get("/reviews", response_model=List[Review])
async def get_reviews(course_id: str):
    reviews = await db.reviews.find({"course_id": course_id}, {"_id": 0}).to_list(1000)
    return reviews

# ==================== CERTIFICATE ROUTES ====================

@api_router.post("/certificates")
async def generate_certificate(course_id: str, user: User = Depends(require_auth)):
    # Check if course is completed
    enrollment = await db.enrollments.find_one({"user_id": user.id, "course_id": course_id})
    if not enrollment or enrollment["progress"] < 100:
        raise HTTPException(status_code=400, detail="Course not completed")
    
    # Check if certificate already exists
    existing = await db.certificates.find_one({"user_id": user.id, "course_id": course_id})
    if existing:
        return existing
    
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    
    certificate = Certificate(
        user_id=user.id,
        course_id=course_id,
        course_title=course["title"] if course else "Unknown",
        certificate_url=f"https://certificates.padhobadho.com/{user.id}/{course_id}"
    )
    
    cert_doc = certificate.model_dump()
    cert_doc["issued_at"] = cert_doc["issued_at"].isoformat()
    await db.certificates.insert_one(cert_doc)
    
    return certificate

@api_router.get("/certificates/my", response_model=List[Certificate])
async def get_my_certificates(user: User = Depends(require_auth)):
    certificates = await db.certificates.find({"user_id": user.id}, {"_id": 0}).to_list(1000)
    return certificates

# ==================== BLOG ROUTES ====================

@api_router.get("/blog", response_model=List[BlogPost])
async def get_blog_posts():
    posts = await db.blog_posts.find({}, {"_id": 0}).sort("published_at", -1).to_list(1000)
    return posts

@api_router.post("/blog", response_model=BlogPost)
async def create_blog_post(req: BlogPostCreate, user: User = Depends(require_role(["admin", "instructor"]))):
    post = BlogPost(**req.model_dump(), author_id=user.id, author_name=user.name)
    post_doc = post.model_dump()
    post_doc["published_at"] = post_doc["published_at"].isoformat()
    await db.blog_posts.insert_one(post_doc)
    
    return post

# ==================== DASHBOARD ROUTES ====================

@api_router.get("/dashboard/student")
async def get_student_dashboard(user: User = Depends(require_auth)):
    enrollments = await db.enrollments.find({"user_id": user.id}, {"_id": 0}).to_list(1000)
    
    # Get enrolled courses
    course_ids = [e["course_id"] for e in enrollments]
    courses = await db.courses.find({"id": {"$in": course_ids}}, {"_id": 0}).to_list(1000)
    
    # Get quiz results
    quiz_results = await db.quiz_results.find({"user_id": user.id}, {"_id": 0}).to_list(1000)
    
    # Get certificates
    certificates = await db.certificates.find({"user_id": user.id}, {"_id": 0}).to_list(1000)
    
    return {
        "enrollments": enrollments,
        "courses": courses,
        "quiz_results": quiz_results,
        "certificates": certificates,
        "total_courses": len(courses),
        "completed_courses": len([e for e in enrollments if e["progress"] >= 100])
    }

@api_router.get("/dashboard/instructor")
async def get_instructor_dashboard(user: User = Depends(require_role(["instructor", "admin"]))):
    courses = await db.courses.find({"instructor_id": user.id}, {"_id": 0}).to_list(1000)
    
    total_enrollments = sum(c.get("total_enrollments", 0) for c in courses)
    
    return {
        "courses": courses,
        "total_courses": len(courses),
        "total_enrollments": total_enrollments
    }

@api_router.get("/dashboard/admin")
async def get_admin_dashboard(user: User = Depends(require_role(["admin"]))):
    total_users = await db.users.count_documents({})
    total_courses = await db.courses.count_documents({})
    total_enrollments = await db.enrollments.count_documents({})
    total_quizzes = await db.quizzes.count_documents({})
    
    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "total_quizzes": total_quizzes
    }

# ==================== AI FEATURES ====================

@api_router.post("/ai/recommendations")
async def get_ai_recommendations(req: AIRecommendationRequest, user: User = Depends(require_auth)):
    try:
        # Get all courses
        all_courses = await db.courses.find({}, {"_id": 0}).to_list(1000)
        
        # Filter out completed courses
        available_courses = [c for c in all_courses if c["id"] not in req.completed_courses]
        
        if not available_courses:
            return {"recommendations": []}
        
        # Build prompt
        interests = ", ".join(req.user_interests) if req.user_interests else "general learning"
        courses_text = "\n".join([f"- {c['title']}: {c['description'][:100]}..." for c in available_courses[:20]])
        
        llm = LlmChat(
            api_key=os.environ["EMERGENT_LLM_KEY"],
            session_id=f"recommend_{user.id}",
            system_message="You are an educational course recommendation assistant. Recommend 5 courses based on user interests."
        ).with_model("openai", "gpt-4o-mini")
        
        message = UserMessage(
            text=f"User interests: {interests}\n\nAvailable courses:\n{courses_text}\n\nRecommend 5 courses (just list the course titles, nothing else)."
        )
        
        response = await llm.send_message(message)
        
        # Parse response and match courses
        recommended_titles = [line.strip("- ").strip() for line in response.split("\n") if line.strip()]
        recommendations = [c for c in available_courses if any(title.lower() in c["title"].lower() for title in recommended_titles)][:5]
        
        return {"recommendations": recommendations}
    except Exception as e:
        logging.error(f"AI recommendation error: {e}")
        # Fallback: return popular courses
        popular = await db.courses.find({}, {"_id": 0}).sort("total_enrollments", -1).limit(5).to_list(5)
        return {"recommendations": popular}

@api_router.post("/ai/chat")
async def ai_chat_tutor(req: AIChatRequest, user: User = Depends(require_auth)):
    try:
        llm = LlmChat(
            api_key=os.environ["EMERGENT_LLM_KEY"],
            session_id=f"chat_{user.id}",
            system_message="You are an educational AI tutor. Help students with their questions. Be concise and clear."
        ).with_model("openai", "gpt-4o-mini")
        
        context_text = f"\nContext: {req.context}" if req.context else ""
        message = UserMessage(text=f"{req.message}{context_text}")
        
        response = await llm.send_message(message)
        
        return {"response": response}
    except Exception as e:
        logging.error(f"AI chat error: {e}")
        return {"response": "Sorry, I'm having trouble responding right now. Please try again later."}

@api_router.post("/ai/generate-quiz")
async def generate_quiz_from_content(req: AIQuizGenerateRequest, user: User = Depends(require_role(["instructor", "admin"]))):
    try:
        llm = LlmChat(
            api_key=os.environ["EMERGENT_LLM_KEY"],
            session_id=f"quiz_gen_{user.id}",
            system_message="You are an educational quiz generator. Generate multiple choice questions from provided content."
        ).with_model("openai", "gpt-4o-mini")
        
        message = UserMessage(
            text=f"Generate {req.num_questions} multiple choice questions from this content:\n\n{req.content}\n\nFormat each question as:\nQ: [question]\nA) [option]\nB) [option]\nC) [option]\nD) [option]\nCorrect: [A/B/C/D]"
        )
        
        response = await llm.send_message(message)
        
        return {"generated_quiz": response}
    except Exception as e:
        logging.error(f"Quiz generation error: {e}")
        return {"generated_quiz": "Error generating quiz. Please try again."}

# ==================== MOCK PAYMENT ROUTES ====================

@api_router.post("/payments/mock")
async def mock_payment(course_id: str, amount: float, user: User = Depends(require_auth)):
    payment = Payment(
        user_id=user.id,
        amount=amount,
        type="course",
        status="completed"
    )
    
    payment_doc = payment.model_dump()
    payment_doc["created_at"] = payment_doc["created_at"].isoformat()
    await db.payments.insert_one(payment_doc)
    
    # Auto-enroll
    enrollment = Enrollment(user_id=user.id, course_id=course_id)
    enrollment_doc = enrollment.model_dump()
    enrollment_doc["enrolled_at"] = enrollment_doc["enrolled_at"].isoformat()
    await db.enrollments.insert_one(enrollment_doc)
    
    return {"message": "Payment successful", "payment_id": payment.id}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()