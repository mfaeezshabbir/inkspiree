# Board element service for handling elements on boards

from typing import List, Optional, Dict, Any

from prisma.errors import PrismaError
from prisma.models import BoardElement

# Change from relative to absolute imports
from db.client import prisma

class BoardElementService:
    @staticmethod
    async def get_elements_by_board_id(board_id: str) -> List[BoardElement]:
        """Get all elements for a board"""
        return await prisma.boardelement.find_many(
            where={"boardId": board_id},
            order={"zIndex": "asc"}
        )
    
    @staticmethod
    async def get_element_by_id(element_id: str) -> Optional[BoardElement]:
        """Get an element by ID"""
        return await prisma.boardelement.find_unique(where={"id": element_id})
    
    @staticmethod
    async def create_element(
        board_id: str,
        element_type: str,
        content: Dict[str, Any],
        position: Dict[str, float],
        size: Optional[Dict[str, float]] = None,
        style: Optional[Dict[str, Any]] = None,
        z_index: int = 0
    ) -> BoardElement:
        """Create a new element on a board"""
        try:
            import json
            
            # Convert Python dictionaries to proper JSON strings for Prisma
            content_json = json.dumps(content)
            position_json = json.dumps(position)
            
            # Handle optional fields
            size_json = json.dumps(size) if size else None
            style_json = json.dumps(style) if style else None
            
            # Create element with explicit Json field handling
            element = await prisma.boardelement.create(
                data={
                    "board": {"connect": {"id": board_id}},  # Use proper connect syntax
                    "type": element_type,
                    "content": content_json,
                    "position": position_json,
                    "size": size_json,
                    "style": style_json,
                    "zIndex": z_index
                }
            )
            return element
        except Exception as e:
            print(f"Error in create_element: {str(e)}")
            import traceback
            print(traceback.format_exc())
            raise
    
    @staticmethod
    async def update_element(element_id: str, data: dict) -> Optional[BoardElement]:
        """Update an element"""
        try:
            import json
            
            # Process JSON fields
            processed_data = {}
            for key, value in data.items():
                if key in ['content', 'position', 'size', 'style'] and value is not None:
                    # Convert dict to JSON string for these fields
                    processed_data[key] = json.dumps(value)
                else:
                    processed_data[key] = value
            
            # Update with processed data
            return await prisma.boardelement.update(
                where={"id": element_id},
                data=processed_data
            )
        except Exception as e:
            print(f"Error in update_element: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return None
    
    @staticmethod
    async def delete_element(element_id: str) -> bool:
        """Delete an element"""
        try:
            await prisma.boardelement.delete(where={"id": element_id})
            return True
        except PrismaError:
            return False
    
    @staticmethod
    async def batch_update_elements(elements: List[Dict[str, Any]]) -> List[BoardElement]:
        """Update multiple elements in batch"""
        results = []
        
        for element in elements:
            element_id = element.pop("id", None)
            if not element_id:
                continue
                
            try:
                updated = await prisma.boardelement.update(
                    where={"id": element_id},
                    data=element
                )
                results.append(updated)
            except PrismaError:
                continue
                
        return results
