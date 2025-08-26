import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Kiểm tra nếu click ngoài menu và ngoài nút hamburger
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    // Thêm event listener cho mousedown
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup khi component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="bg-blue-600 text-white shadow-md z-50 relative">
      <nav className="max-w-screen-xl mx-auto p-4 flex items-center justify-between">
        {/* Logo/Tên quán */}
        <div className="text-lg sm:text-xl font-bold">
          <Link to="/" className="hover:underline">
            Coffee Shop
          </Link>
        </div>

        {/* Nút Hamburger cho mobile */}
        <button
          ref={buttonRef}
          className="sm:hidden text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
        >
          {isMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          )}
        </button>

        {/* Menu điều hướng */}
        <ul
          ref={menuRef}
          className={`${
            isMenuOpen ? 'flex' : 'hidden'
          } sm:flex flex-col sm:flex-row absolute sm:static top-16 left-0 w-full sm:w-auto bg-blue-600 sm:bg-transparent sm:items-center sm:space-x-6 space-y-4 sm:space-y-0 p-4 sm:p-0 transition-all duration-300 ease-in-out z-50`}
        >
          <li>
            <Link
              to="/order"
              className="block text-sm sm:text-base hover:underline py-2 sm:py-0"
              onClick={() => setIsMenuOpen(false)}
            >
              Phục Vụ
            </Link>
          </li>
          <li>
            <Link
              to="/bartender"
              className="block text-sm sm:text-base hover:underline py-2 sm:py-0"
              onClick={() => setIsMenuOpen(false)}
            >
              Pha Chế
            </Link>
          </li>
          <li>
            <Link
              to="/manager"
              className="block text-sm sm:text-base hover:underline py-2 sm:py-0"
              onClick={() => setIsMenuOpen(false)}
            >
              Quản Lý
            </Link>
          </li>
          <li>
            <Link
              to="/preparation"
              className="block text-sm sm:text-base hover:underline py-2 sm:py-0"
              onClick={() => setIsMenuOpen(false)}
            >
              Sơ Chế
            </Link>
          </li>
          <li>
            <Link
              to="/recipe"
              className="block text-sm sm:text-base hover:underline py-2 sm:py-0"
              onClick={() => setIsMenuOpen(false)}
            >
              Công Thức
            </Link>
          </li>
          <li>
            <Link
              to="/daily-tasks"
              className="block text-sm sm:text-base hover:underline py-2 sm:py-0"
              onClick={() => setIsMenuOpen(false)}
            >
              Công Việc Hàng Ngày
            </Link>
          </li>
          <li>
            <Link
              to="/timesheet"
              className="block text-sm sm:text-base hover:underline py-2 sm:py-0"
              onClick={() => setIsMenuOpen(false)}
            >
              Chấm Công
            </Link>
          </li>
          <li>
            <Link
              to="/admin"
              className="block text-sm sm:text-base hover:underline py-2 sm:py-0"
              onClick={() => setIsMenuOpen(false)}
            >
              Đăng nhập
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;