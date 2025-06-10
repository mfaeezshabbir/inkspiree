# Board routes for the API

from typing import List
import logging
import traceback

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse

# Change from relative to absolute imports
from schemas.models import BoardCreate, BoardResponse, BoardUpdate
from services.board_service import BoardService

# Mock auth for now - in a real app, you would use proper JWT auth
async def get_current_user_id():
    # This is a placeholder for actual authentication
    return "user-123"

router = APIRouter(prefix="/api/boards", tags=["boards"])

@router.get("/", response_model=List[BoardResponse])
async def get_boards(current_user_id: str = Depends(get_current_user_id)):
    """Get all boards for the current user"""
    return await BoardService.get_all_boards(current_user_id)

@router.get("/{board_id}", response_model=BoardResponse)
async def get_board(board_id: str, current_user_id: str = Depends(get_current_user_id)):
    """Get a single board by ID"""
    board = await BoardService.get_board_by_id(board_id, current_user_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Board with ID {board_id} not found"
        )
    return board

@router.post("/", response_model=BoardResponse, status_code=status.HTTP_201_CREATED)
async def create_board(
    request: Request,
    board: BoardCreate, 
    current_user_id: str = Depends(get_current_user_id)
):
    """Create a new board"""
    try:
        # Log the request body for debugging
        body = await request.json()
        print(f"Received create board request: {body}")
        
        # Log the current user ID
        print(f"Current user ID: {current_user_id}")
        
        result = await BoardService.create_board(
            user_id=current_user_id, 
            title=board.title, 
            description=board.description
        )
        print(f"Board created: {result}")
        return result
    except Exception as e:
        print(f"Error creating board: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating board: {str(e)}"
        )

@router.put("/{board_id}", response_model=BoardResponse)
async def update_board(
    board_id: str, board: BoardUpdate, current_user_id: str = Depends(get_current_user_id)
):
    """Update an existing board"""
    updated_board = await BoardService.update_board(
        board_id=board_id,
        user_id=current_user_id,
        data=board.dict(exclude_unset=True)
    )
    
    if not updated_board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Board with ID {board_id} not found"
        )
        
    return updated_board

@router.delete("/{board_id}")
async def delete_board(board_id: str, current_user_id: str = Depends(get_current_user_id)):
    """Delete a board"""
    success = await BoardService.delete_board(board_id, current_user_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Board with ID {board_id} not found"
        )
        
    return JSONResponse(
        status_code=status.HTTP_204_NO_CONTENT,
        content=None
    )
