import { createContext } from 'react';
export interface Breadcrumb {
  label: string;
  href?: string;
}
export interface BreadcrumbContextType {
  breadcrumbs: Breadcrumb[];
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
}
export const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);