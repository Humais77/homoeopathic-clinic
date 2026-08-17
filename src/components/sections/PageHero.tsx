import { PageHeroClient } from './PageHeroClient';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  breadcrumb?: { label: string; href: string }[];
  backgroundImage?: string;
  children?: React.ReactNode;
}

export function PageHero(props: PageHeroProps) {
  return <PageHeroClient {...props} />;
}