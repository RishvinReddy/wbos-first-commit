import ClientBuilder from "./client";

export async function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { id: string } }) {
  return <ClientBuilder id={params.id} />;
}
