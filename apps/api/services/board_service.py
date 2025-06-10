# Board service for handling board operations

from typing import List, Optional

from prisma.errors import PrismaError
from prisma.models import Board, BoardElement

# Change from relative to absolute imports
from db.client import prisma

class BoardService:
    @staticmethod
    async def get_all_boards(user_id: str) -> List[Board]:
        """Get all boards for a user"""
        return await prisma.board.find_many(
            where={"userId": user_id},
            order={"updatedAt": "desc"}
        )
    
    @staticmethod
    async def get_board_by_id(board_id: str, user_id: Optional[str] = None) -> Optional[Board]:
        """Get a board by ID, optionally filtering by user_id"""
        where_clause = {"id": board_id}
        if user_id:
            where_clause["userId"] = user_id
            
        return await prisma.board.find_first(
            where=where_clause,
            include={"elements": True}
        )
    
    @staticmethod
    async def create_board(user_id: str, title: str, description: Optional[str] = None) -> Board:
        """Create a new board"""
        try:
            return await prisma.board.create(
                data={
                    "userId": user_id,
                    "title": title,
                    "description": description
                }
            )
        except PrismaError as e:
            print(f"Database error creating board: {str(e)}")
            raise
    
    @staticmethod
    async def update_board(board_id: str, user_id: str, data: dict) -> Optional[Board]:
        """Update a board"""
        try:
            return await prisma.board.update(
                where={
                    "id": board_id,
                    "userId": user_id,
                },
                data=data
            )
        except PrismaError:
            return None
    
    @staticmethod
    async def delete_board(board_id: str, user_id: str) -> bool:
        """Delete a board"""
        try:
            await prisma.board.delete(
                where={
                    "id": board_id,
                    "userId": user_id,
                }
            )
            return True
        except PrismaError:
            return False
