"use client";

import type { FC } from "react";
import { useEffect } from "react";
import { observer } from "mobx-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "@plane/i18n";
import { Button } from "@plane/propel/button";
import type { TProjectLinkEditableFields } from "@plane/types";
import { Input, ModalCore } from "@plane/ui";

export type TProjectLinkFormData = TProjectLinkEditableFields & {
  id?: string;
};

export type TProjectLinkOperations = {
  create: (data: TProjectLinkEditableFields) => Promise<void>;
  update: (linkId: string, data: Partial<TProjectLinkEditableFields>) => Promise<void>;
  remove: (linkId: string) => Promise<void>;
};

export type TProjectLinkModalProps = {
  isOpen: boolean;
  onClose: () => void;
  linkOperations: Omit<TProjectLinkOperations, "remove">;
  preloadedData?: TProjectLinkFormData;
};

const defaultValues: TProjectLinkFormData = {
  title: "",
  url: "",
};

export const ProjectLinkModal: FC<TProjectLinkModalProps> = observer((props) => {
  const { isOpen, onClose, linkOperations, preloadedData } = props;
  const { t } = useTranslation();

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    control,
    reset,
  } = useForm<TProjectLinkFormData>({
    defaultValues,
  });

  const handleFormSubmit = async (formData: TProjectLinkFormData) => {
    const parsedUrl = formData.url.startsWith("http") ? formData.url : `http://${formData.url}`;
    try {
      if (!formData.id) {
        await linkOperations.create({ title: formData.title, url: parsedUrl });
      } else {
        await linkOperations.update(formData.id, { title: formData.title, url: parsedUrl });
      }
      onClose();
    } catch (error) {
      console.error("Error saving link:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      reset({ ...defaultValues, ...preloadedData });
    }
    return () => reset(defaultValues);
  }, [isOpen, preloadedData, reset]);

  return (
    <ModalCore isOpen={isOpen} handleClose={onClose}>
      <form onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}>
        <div className="space-y-5 p-5">
          <h3 className="text-lg font-medium text-custom-text-100">
            {preloadedData?.id ? t("common.update_link") : t("add_link")}
          </h3>
          <div className="mt-2 space-y-3">
            <div>
              <label htmlFor="url" className="mb-2 text-custom-text-200 text-sm font-medium">
                {t("common.url")}
              </label>
              <Controller
                control={control}
                name="url"
                rules={{
                  required: t("common.url_is_invalid"),
                }}
                render={({ field: { value, onChange, ref } }) => (
                  <Input
                    id="url"
                    type="text"
                    value={value}
                    onChange={onChange}
                    ref={ref}
                    hasError={Boolean(errors.url)}
                    placeholder={t("common.type_or_paste_a_url")}
                    className="w-full"
                  />
                )}
              />
              {errors.url && <span className="text-xs text-red-500">{t("common.url_is_invalid")}</span>}
            </div>
            <div>
              <label htmlFor="title" className="mb-2 text-custom-text-200 text-sm font-medium">
                {t("common.display_title")}
                <span className="text-xs block text-custom-text-300">{t("optional")}</span>
              </label>
              <Controller
                control={control}
                name="title"
                render={({ field: { value, onChange, ref } }) => (
                  <Input
                    id="title"
                    type="text"
                    value={value}
                    onChange={onChange}
                    ref={ref}
                    hasError={Boolean(errors.title)}
                    placeholder={t("common.link_title_placeholder")}
                    className="w-full"
                  />
                )}
              />
            </div>
          </div>
        </div>
        <div className="px-5 py-4 flex items-center justify-end gap-2 border-t border-custom-border-200">
          <Button variant="secondary" size="lg" onClick={onClose} type="button">
            {t("cancel")}
          </Button>
          <Button variant="primary" size="lg" type="submit" loading={isSubmitting}>
            {preloadedData?.id
              ? isSubmitting
                ? t("common.updating")
                : t("common.update_link")
              : isSubmitting
                ? t("adding")
                : t("add_link")}
          </Button>
        </div>
      </form>
    </ModalCore>
  );
});
