import BoardsList from "@/components/BoardsList";

export default function BoardsPage() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-gradient-to-br from-indigo-50 via-white to-blue-100">
      <div className="w-full max-w-5xl mx-auto px-4 py-12 animate-fadeIn">
        <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-tr from-indigo-700 to-blue-500 bg-clip-text text-transparent">
          Your Boards
        </h1>
        <BoardsList />
      </div>
    </div>
  );
}
