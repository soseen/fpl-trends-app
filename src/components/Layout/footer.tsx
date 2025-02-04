import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="mt-4 border-t-2 border-secondary bg-primary p-4 text-center text-text">
      <p>&copy; {new Date().getFullYear()} FPL Trends. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
