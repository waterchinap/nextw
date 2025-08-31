// app/_lib/Footer.tsx

export default function Footer() {
  return (
    <footer className="bg-white border-t py-6">
      <div className="max-w-6xl mx-auto px-4 text-center text-gray-500">
        <p>© {new Date().getFullYear()} 天气预报系统. All rights reserved.</p>
      </div>
    </footer>
  );
}
