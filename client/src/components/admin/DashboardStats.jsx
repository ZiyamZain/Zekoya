const StatBox = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4 w-full md:w-1/4">
    <div className="text-purple-600 text-2xl">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  </div>
);
