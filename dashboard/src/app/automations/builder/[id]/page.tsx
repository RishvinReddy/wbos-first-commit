import ClientBuilder from "./client";

export async function generateStaticParams() {
  return [{ id: 'new' }];
}

export default function Page({ params }: { params: { id: string } }) {
  return <ClientBuilder id={params.id} />;
}
