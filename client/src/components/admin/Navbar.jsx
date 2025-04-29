
const Navbar = () => {
  return (
    <div className="h-16 bg-white shadow flex items-center justify-end pr-6 fixed top-0 left-64 right-0 z-10">
      <div className="flex items-center space-x-4">
        <span className="font-medium">Admin</span>
        <img
          src="/admin-avatar.png"
          alt="Admin Avatar"
          className="w-8 h-8 rounded-full"
        />
      </div>
    </div>
  );
};

export default Navbar;
