"use client";

import { SidebarTrigger } from "../ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Separator } from "../ui/separator";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { UploadDialog } from "../dialog";

const data = {
  name: "Haley Johnson",
  email: "hello@example.com",
  avatar: "/images/avatar/default.jpg",
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUpload = (file: File) => {
    // Generate a mock ID for the uploaded file
    const mockId = Date.now().toString();
    router.push(`/invoices/${mockId}`);
  };

  // Generate breadcrumb items from the pathname
  const generateBreadcrumbs = () => {
    if (!pathname) return [];

    // Remove leading slash and split into segments
    const pathSegments = pathname
      .split("/")
      .filter((segment) => segment !== "");

    // Create breadcrumb items
    const breadcrumbs = pathSegments.map((segment, index) => {
      const href = "/" + pathSegments.slice(0, index + 1).join("/");
      const isLast = index === pathSegments.length - 1;
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return {
        href,
        label,
        isLast,
      };
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-6"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {breadcrumbs.length > 0 && (
              <BreadcrumbSeparator className="hidden md:block" />
            )}

            {breadcrumbs.map((breadcrumb, index) => (
              <BreadcrumbItem key={breadcrumb.href}>
                {breadcrumb.isLast ? (
                  <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink asChild className="hidden md:block">
                      <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                    </BreadcrumbLink>
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto flex items-center gap-4 px-4">
        <UploadDialog onUpload={handleUpload} buttonStyle="icon-only" />
        <Avatar className="h-8 w-8 rounded-full">
          <AvatarImage
            src={data.avatar}
            alt={data.name}
            className="rounded-full"
          />
          <AvatarFallback>HJ</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
