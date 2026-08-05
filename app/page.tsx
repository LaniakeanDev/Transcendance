import Logo from '@/public/logo';
import GlintPost from '@/components/post';

export default function Home() {
  return (
    <main className="">
      <div className="flex flex-row items-center gap-4">
        <Logo size={40} />
        <h1 className="text-3xl">Glint</h1>
      </div>
      <GlintPost />
    </main>
  );
}
