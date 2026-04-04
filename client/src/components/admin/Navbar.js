import Link from 'next/link';

export default function Navbar() {
  return (
    <div className="bg-gray-700 text-white p-4 flex gap-4">
      <Link className="hover:text-yellow-400" href={'/'}>
        Home
      </Link>
      <Link className="hover:text-yellow-400" href={'/about'}>
        About
      </Link>
    </div>
  );
}
