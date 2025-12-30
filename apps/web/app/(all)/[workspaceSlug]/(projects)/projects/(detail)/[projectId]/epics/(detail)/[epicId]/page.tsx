import { useTheme } from "next-themes";
import { useParams } from "next/navigation";
import { useTranslation } from "@plane/i18n";
// assets
import emptyIssueDark from "@/app/assets/empty-state/search/issues-dark.webp?url";
import emptyIssueLight from "@/app/assets/empty-state/search/issues-light.webp?url";
// components
import { EmptyState } from "@/components/common/empty-state";
import { LogoSpinner } from "@/components/common/logo-spinner";
// hooks
import { useAppRouter } from "@/hooks/use-app-router";

export default function EpicDetailsPage() {
  const router = useAppRouter();
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const { workspaceSlug } = useParams();

  // For now, redirect to browse page or show error
  // This page will handle direct epic URL access
  return (
    <div className="flex items-center justify-center size-full">
      <EmptyState
        image={resolvedTheme === "dark" ? emptyIssueDark : emptyIssueLight}
        title="Epic not found"
        description="The epic you are looking for does not exist or has been deleted."
        primaryButton={{
          text: "View all epics",
          onClick: () => router.push(`/${workspaceSlug}/projects`),
        }}
      />
    </div>
  );
}
