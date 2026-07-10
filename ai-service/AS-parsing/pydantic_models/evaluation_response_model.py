from __future__ import annotations
from enum import Enum
from typing import List
from pydantic import BaseModel, Field

class PaperClarity(str, Enum):
    CLEAR = "clear"
    PARTIALLY_CLEAR = "partially_clear"
    UNCLEAR = "unclear"

class AttemptStatus(str, Enum):
    ATTEMPTED = "attempted"
    PARTIAL = "partial"
    CROSSED_OUT = "crossed_out"
    UNCERTAIN = "uncertain"

class StudentMetadata(BaseModel):
    # Removed defaults to force Gemini to populate empty strings if not found
    name: str
    rollNumber: str
    examCode: str
    subject: str

class EarnedMarks(BaseModel):
    value: float = Field(description="Marks awarded for this answer.")
    reason: str = Field(description="Short explanation for marks awarded or deducted.")

class ParsingStatus(BaseModel):
    success: bool
    paperClarity: PaperClarity
    overallConfidence: float = Field(ge=0, le=1)
    errors: List[str]  # Required list
    warnings: List[str]

class AnswerBlock(BaseModel):
    id: str
    sourcePages: List[int]
    attemptStatus: AttemptStatus
    confidence: float = Field(ge=0, le=1)
    errors: List[str]
    warnings: List[str]
    issues: List[str]
    answerSummary: str = Field(description="Concise semantic understanding of the student's answer.")
    satisfies: List[str]
    missing: List[str]
    earnedMarks: EarnedMarks
    children: List["AnswerBlock"]

# Rebuild for recursion
AnswerBlock.model_rebuild()

class AttemptSummary(BaseModel):
    totalAnswerBlocks: int
    attemptedQuestionIds: List[str]

class EvaluationOutput(BaseModel):
    studentMetadata: StudentMetadata
    parsingStatus: ParsingStatus
    answerBlocks: List[AnswerBlock]
    invalidAnswers: List[str]
    attemptSummary: AttemptSummary