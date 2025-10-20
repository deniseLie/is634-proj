export function GameDetail() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Game Marketplace</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* {mockGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))} */}
      </div>
    </div>
  );
}