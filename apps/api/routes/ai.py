# AI routes for the API
from typing import Dict, Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

# Change from relative to absolute imports
from services.ai_service import AIService
from services.board_service import BoardService
from services.element_service import BoardElementService

# Mock auth for now - in a real app, you would use proper JWT auth
async def get_current_user_id():
    # This is a placeholder for actual authentication
    return "user-123"

# Request model
class AIGenerateRequest(BaseModel):
    text: str
    boardId: str
    
class AIAnalyzeRequest(BaseModel):
    boardId: str

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.post("/generate")
async def generate_elements(
    request: AIGenerateRequest,
    current_user_id: str = Depends(get_current_user_id)
):
    """Generate board elements from text using AI"""
    # Verify the user has access to this board
    board = await BoardService.get_board_by_id(request.boardId, current_user_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Board with ID {request.boardId} not found or access denied"
        )
    
    # Use AI service to generate elements from text
    elements = await AIService.generate_elements_from_text(
        text=request.text,
        board_id=request.boardId
    )
    
    # Create the elements in the database
    created_elements = []
    for elem in elements:
        created = await BoardElementService.create_element(
            board_id=elem["boardId"],
            element_type=elem["type"],
            content=elem["content"],
            position=elem["position"],
            size=elem["size"],
            style=elem["style"],
            z_index=elem["zIndex"]
        )
        created_elements.append(created)
    
    return created_elements

@router.post("/analyze")
async def analyze_board(
    request: AIAnalyzeRequest,
    current_user_id: str = Depends(get_current_user_id)
):
    """Analyze a board using AI to provide insights"""
    # Verify the user has access to this board
    board = await BoardService.get_board_by_id(request.boardId, current_user_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Board with ID {request.boardId} not found or access denied"
        )
    
    # Get all elements for the board
    elements = await BoardElementService.get_elements_by_board_id(request.boardId)
    
    # Use AI service to analyze the board
    analysis = await AIService.analyze_board(elements)
    
    return analysis
