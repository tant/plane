"use client";

import { observer } from "mobx-react";
// plane imports
import { Avatar } from "@plane/propel/avatar";
import { Tooltip } from "@plane/propel/tooltip";
import { AvatarGroup } from "@plane/ui";
// store
import type { TPageInstance } from "@/store/pages/base-page";

export type TPageCollaboratorsListProps = {
  page: TPageInstance;
};

export const PageCollaboratorsList = observer(function PageCollaboratorsList({ page }: TPageCollaboratorsListProps) {
  const { collaborators } = page.editor;

  // Don't render if no collaborators
  if (!collaborators || collaborators.length === 0) return null;

  return (
    <div className="flex items-center">
      <AvatarGroup max={3} size="sm" showTooltip={false}>
        {collaborators.map((collaborator) => (
          <Tooltip key={collaborator.id} tooltipContent={collaborator.name} position="bottom">
            <div>
              <Avatar
                name={collaborator.name}
                size="sm"
                fallbackBackgroundColor={collaborator.color}
                fallbackTextColor="#ffffff"
              />
            </div>
          </Tooltip>
        ))}
      </AvatarGroup>
    </div>
  );
});
