import BoardPage from "@/components/BoardPage";

interface BoardViewProps {
  params: Promise<{
    boardId: string;
  }>;
}

export default async function BoardView({ params }: BoardViewProps) {
  const { boardId } = await params;
  return <BoardPage boardId={boardId} />;
}
