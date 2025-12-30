import { action, makeObservable, observable, runInAction } from "mobx";
// plane imports
import type { EditorRefApi, TCollaborator, TEditorAsset } from "@plane/editor";

export type TPageEditorInstance = {
  // observables
  assetsList: TEditorAsset[];
  collaborators: TCollaborator[];
  editorRef: EditorRefApi | null;
  // actions
  setEditorRef: (editorRef: EditorRefApi | null) => void;
  updateAssetsList: (assets: TEditorAsset[]) => void;
  updateCollaborators: (collaborators: TCollaborator[]) => void;
};

export class PageEditorInstance implements TPageEditorInstance {
  // observables
  editorRef: EditorRefApi | null = null;
  assetsList: TEditorAsset[] = [];
  collaborators: TCollaborator[] = [];

  constructor() {
    makeObservable(this, {
      // observables
      editorRef: observable.ref,
      assetsList: observable,
      collaborators: observable,
      // actions
      setEditorRef: action,
      updateAssetsList: action,
      updateCollaborators: action,
    });
  }

  setEditorRef: TPageEditorInstance["setEditorRef"] = (editorRef) => {
    runInAction(() => {
      this.editorRef = editorRef;
    });
  };

  updateAssetsList: TPageEditorInstance["updateAssetsList"] = (assets) => {
    runInAction(() => {
      this.assetsList = assets;
    });
  };

  updateCollaborators: TPageEditorInstance["updateCollaborators"] = (collaborators) => {
    runInAction(() => {
      this.collaborators = collaborators;
    });
  };
}
