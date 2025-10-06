import { ChangeEvent, FocusEvent, useCallback, useMemo } from 'react';
import {
  WidgetProps,
  StrictRJSFSchema,
  RJSFSchema,
  FormContextType,
  getInputProps,
  ariaDescribedByIds,
  examplesId,
} from '@rjsf/utils';

/** The `BaseInputTemplate` component is a template for rendering basic input elements
 * with DaisyUI styling. It's used as the foundation for various input types in forms.
 *
 * Features:
 * - Wraps input in DaisyUI's form-control for proper spacing
 * - Uses DaisyUI's input and input-bordered classes for styling
 * - Includes a hidden label for accessibility
 * - Handles common input properties like disabled and readonly states
 * - Processes input props based on schema type and options
 * - Supports schema examples with datalist
 * - Handles onChange, onBlur, and onFocus events
 * - Displays the remaining byte length based on options?.maxByteLength
 *
 * @param props - The `WidgetProps` for the component
 */
export default function BaseInputTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>(props: WidgetProps<T, S, F>) {
  const {
    id,
    value,
    required,
    disabled,
    readonly,
    autofocus,
    onChange,
    onBlur,
    onFocus,
    onChangeOverride,
    options,
    schema,
    type,
    label,
    placeholder,
  } = props;

  const inputProps = getInputProps<T, S, F>(schema, type, options);

  // Extract step, min, max, accept from inputProps
  const { step, min, max, accept, ...rest } = inputProps;
  const htmlInputProps = {
    step,
    min,
    max,
    accept,
    ...(schema.examples ? { list: examplesId(id) } : undefined),
  };

  const maxByteLength = options?.maxByteLength;

  const byteLength = useMemo(() => {
    return new TextEncoder().encode(value).length;
  }, [value]);

  const _onChange = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      if (maxByteLength && new TextEncoder().encode(value).length > maxByteLength) {
        return;
      }

      return onChange(value === '' ? options.emptyValue : value);
    },
    [onChange, options],
  );

  const _onBlur = useCallback(
    ({ target }: FocusEvent<HTMLInputElement>) => onBlur && onBlur(id, target.value),
    [onBlur, id],
  );

  const _onFocus = useCallback(
    ({ target }: FocusEvent<HTMLInputElement>) => onFocus && onFocus(id, target.value),
    [onFocus, id],
  );

  return (
    <>
      <div className='form-control'>
        <label htmlFor={id} className='label hidden' style={{ display: 'none' }}>
          <span className='label-text mb-2'>{label}</span>
        </label>
        <input
          id={id}
          name={id}
          value={value || value === 0 ? value : ''}
          placeholder={placeholder}
          required={required}
          disabled={disabled || readonly}
          autoFocus={autofocus}
          className='input input-bordered w-full'
          {...rest}
          {...htmlInputProps}
          onChange={onChangeOverride || _onChange}
          onBlur={_onBlur}
          onFocus={_onFocus}
          aria-describedby={ariaDescribedByIds(id, !!schema.examples)}
        />
        {maxByteLength && (
          <div className='text-right text-xs text-base-content/50 mt-2'>
            {byteLength}/{maxByteLength}
          </div>
        )}
      </div>
      {Array.isArray(schema.examples) && (
        <datalist id={examplesId(id)}>
          {(schema.examples as string[])
            .concat(schema.default && !schema.examples.includes(schema.default) ? ([schema.default] as string[]) : [])
            .map((example: any) => {
              return <option key={example} value={example} />;
            })}
        </datalist>
      )}
    </>
  );
}
