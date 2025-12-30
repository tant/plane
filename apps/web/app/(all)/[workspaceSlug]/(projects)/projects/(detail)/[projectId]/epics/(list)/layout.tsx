// components
import { Outlet } from "react-router";
import { AppHeader } from "@/components/core/app-header";
import { ContentWrapper } from "@/components/core/content-wrapper";
import { ProjectEpicsHeader } from "./header";

export default function ProjectEpicsLayout() {
  return (
    <>
      <AppHeader header={<ProjectEpicsHeader />} />
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </>
  );
}
