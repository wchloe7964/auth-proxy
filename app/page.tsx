// app/page.tsx
export default function Dashboard() {
  return (
    <main className="p-8 font-sans">
      <h1 className="text-2xl font-bold border-b pb-4">
        Fiesta Proxy Dashboard
      </h1>

      <div className="mt-6 grid gap-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 font-medium">✓ Proxy Engine: Online</p>
        </div>

        <div className="p-6 border rounded-xl shadow-sm bg-white">
          <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
          <p className="text-gray-500">Waiting for incoming loot...</p>
          {/* Later, you will fetch your MongoDB data here */}
        </div>
      </div>
    </main>
  );
}
