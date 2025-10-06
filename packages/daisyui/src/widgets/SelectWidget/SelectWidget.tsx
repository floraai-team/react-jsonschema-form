import { FocusEvent, useCallback } from "react";
import {
  enumOptionsIndexForValue,
  enumOptionsValueForIndex,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from "@rjsf/utils";

/** The `SelectWidget` component renders a select input with DaisyUI styling
 *
 * Features:
 * - Supports both single and multiple selection
 * - Handles enumerated objects and primitive values
 * - Uses DaisyUI select styling with proper width
 * - Supports required, disabled, and readonly states
 * - Manages focus and blur events for accessibility
 * - Provides placeholder option when needed
 *
 * @param props - The `WidgetProps` for this component
 */
export default function SelectWidget<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({
  schema,
  id,
  options,
  label,
  disabled,
  placeholder,
  readonly,
  value,
  multiple,
  onChange,
  onBlur,
  onFocus,
}: WidgetProps<T, S, F>) {
  const { enumOptions, emptyValue: optEmptyVal } = options;
  multiple = typeof multiple === "undefined" ? false : !!multiple;

  const getDisplayValue = (val: any) => {
    if (!val) {
      return "";
    }
    if (typeof val === "object") {
      if (val.name) {
        return val.name;
      }
      return val.label || JSON.stringify(val);
    }
    return String(val);
  };

  const isEnumeratedObject =
    enumOptions &&
    enumOptions[0]?.value &&
    typeof enumOptions[0].value === "object";

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (multiple) {
        const selectedOptions = Array.from(event.target.selectedOptions);
        const newValue = selectedOptions.map((option) => {
          const index = Number(option.value);
          return isEnumeratedObject
            ? enumOptions[index].value
            : enumOptionsValueForIndex<S>(
                String(index),
                enumOptions,
                optEmptyVal
              );
        });
        onChange(newValue);
      } else {
        const index = event.target.value;
        onChange(
          index === ""
            ? optEmptyVal
            : isEnumeratedObject
            ? enumOptions[Number(index)].value
            : enumOptionsValueForIndex<S>(index, enumOptions, optEmptyVal)
        );
      }
    },
    [multiple, isEnumeratedObject, enumOptions, optEmptyVal, onChange]
  );

  const _onBlur = useCallback(
    (event: FocusEvent<HTMLSelectElement>) => {
      if (onBlur) {
        onBlur(id, event.target.value);
      }
    },
    [onBlur, id]
  );

  const _onFocus = useCallback(
    (event: FocusEvent<HTMLSelectElement>) => {
      if (onFocus) {
        onFocus(id, event.target.value);
      }
    },
    [onFocus, id]
  );

  const selectedIndexes = enumOptionsIndexForValue<S>(
    value,
    enumOptions,
    multiple
  );
  const selectedValues = Array.isArray(selectedIndexes)
    ? selectedIndexes
    : [selectedIndexes];

  const optionsList =
    enumOptions ||
    (Array.isArray(schema.examples)
      ? schema.examples.map((example) => ({ value: example, label: example }))
      : []);

  return (
    <div className="form-control w-full">
      <select
        id={id}
        className={`select select-bordered w-full ${
          disabled || readonly ? "select-disabled" : ""
        }`}
        value={multiple ? undefined : selectedValues[0] || ""}
        multiple={multiple}
        disabled={disabled || readonly}
        onChange={handleChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
      >
        {!multiple && (
          <option value="" disabled>
            {placeholder || label || "Select..."}
          </option>
        )}
        {optionsList.map(({ label }, i) => (
          <option
            key={i}
            value={i}
            selected={multiple ? selectedValues.includes(String(i)) : undefined}
          >
            {(schema as any).enumNames?.[i] ||
              (isEnumeratedObject ? label : getDisplayValue(label))}
          </option>
        ))}
      </select>
    </div>
  );
}
