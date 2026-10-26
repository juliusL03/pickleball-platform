import Link from 'next/link';
import { HomePage } from '@juls/pickleball-kit/templates';

export default function Page() {
  return <HomePage LinkComponent={Link} />;
}
