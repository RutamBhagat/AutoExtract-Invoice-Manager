import EnhancedEditableDataTable from "./_component/enhanced-editable-data-table";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="mb-8 text-4xl font-bold">
          Enhanced Editable Data Table
        </h1>
        <EnhancedEditableDataTable />
      </div>
    </main>
  );
}
