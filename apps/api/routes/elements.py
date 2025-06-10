# Board element routes for the API

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

# Change from relative to absolute imports
from schemas.models import (
    BoardElementCreate, 
    BoardElementResponse, 
    BoardElementUpdate
)
from services.element_service import BoardElementService
from services.board_service import BoardService

# Mock auth for now - in a real app, you would use proper JWT auth
async def get_current_user_id():
    # This is a placeholder for actual authentication
    return "user-123"

router = APIRouter(prefix="/api/elements", tags=["elements"])

@router.get("/board/{board_id}", response_model=List[BoardElementResponse])
async def get_board_elements(
    board_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """Get all elements for a board"""
    # First verify the user has access to this board
    board = await BoardService.get_board_by_id(board_id, current_user_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Board with ID {board_id} not found or access denied"
        )
    
    return await BoardElementService.get_elements_by_board_id(board_id)

@router.post("/", response_model=BoardElementResponse, status_code=status.HTTP_201_CREATED)
async def create_element(
    element: BoardElementCreate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Create a new element on a board"""
    try:
        # Log the incoming request for debugging
        print(f"Creating element: {element}")
        
        # Verify the user has access to the board
        board = await BoardService.get_board_by_id(element.boardId, current_user_id)
        if not board:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Board with ID {element.boardId} not found or access denied"
            )
        
        # Create the element with better error handling
        position_dict = element.position.dict() if element.position else {"x": 0, "y": 0}
        size_dict = element.size.dict() if element.size else None
        
        # Create the element
        result = await BoardElementService.create_element(
            board_id=element.boardId,
            element_type=element.type,
            content=element.content,
            position=position_dict,
            size=size_dict,
            style=element.style,
            z_index=element.zIndex
        )
        
        print(f"Element created successfully: {result}")
        return result
    except Exception as e:
        import traceback
        print(f"Error creating element: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to create element: {str(e)}"
        )

@router.put("/{element_id}", response_model=BoardElementResponse)
async def update_element(
    element_id: str,
    element: BoardElementUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """Update an existing element"""
    # Get the element
    existing_element = await BoardElementService.get_element_by_id(element_id)
    if not existing_element:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Element with ID {element_id} not found"
        )
    
    # Verify the user has access to the board
    board = await BoardService.get_board_by_id(existing_element.boardId, current_user_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this board"
        )
    
    # Prepare data for update
    update_data = element.dict(exclude_unset=True)
    
    # Convert nested Pydantic models to dict if present
    if 'position' in update_data and update_data['position']:
        update_data['position'] = update_data['position'].dict()
    if 'size' in update_data and update_data['size']:
        update_data['size'] = update_data['size'].dict()
    
    # Update the element
    updated_element = await BoardElementService.update_element(element_id, update_data)
    
    if not updated_element:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Element with ID {element_id} not found"
        )
        
    return updated_element

@router.delete("/{element_id}")
async def delete_element(
    element_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """Delete an element"""
    # Get the element
    element = await BoardElementService.get_element_by_id(element_id)
    if not element:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Element with ID {element_id} not found"
        )
    
    # Verify the user has access to the board
    board = await BoardService.get_board_by_id(element.boardId, current_user_id)
    if not board:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this board"
        )
    
    # Delete the element
    success = await BoardElementService.delete_element(element_id)
    
    return JSONResponse(
        status_code=status.HTTP_204_NO_CONTENT,
        content=None
    )
