import {
  TitleFieldProps,
  StrictRJSFSchema,
  RJSFSchema,
  FormContextType,
  getUiOptions,
} from "@rjsf/utils";

/** The `TitleField` component renders the title for a form section or field
 * with DaisyUI styling. It displays:
 *
 * - Large heading with primary color
 * - Divider element below the title for visual separation
 * - Support for title override from UI options
 *
 * This component is typically used at the top of form sections to provide clear visual hierarchy.
 *
 * @param props - The `TitleFieldProps` for the component
 */
export default function TitleField<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: TitleFieldProps<T, S, F>) {
  const { id, title, uiSchema } = props;
  const uiOptions = getUiOptions<T, S, F>(uiSchema);

  return (
    <div id={id} className="title-field">
      <h2 className="text-xl font-bold">{uiOptions.title || title}</h2>
      <div className="divider my-2"></div>
    </div>
  );
}
