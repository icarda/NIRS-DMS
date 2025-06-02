import { Header } from "./header";

type PageWrapperProps = {
  title: string;
  children: React.ReactNode;
};

export default function PageWrapper({ title, children }: PageWrapperProps) {
  return (
    <>
      <Header title={title} />
      <div className="py-2 font-[family-name:var(--font-inter)] md:px-4">
        {children}
      </div>
    </>
  );
}
