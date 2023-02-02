import { type ZodError, type ZodIssue, ZodIssueCode } from 'zod';

import { coerce_array } from './coerce-array.js';
import { type ErrorResponseErrorObject } from './error-response.schema.js';
import { group_to_map } from './group-to-map.js';
import { type ParamType } from './param-type.schema.js';
import { uniq_with } from './uniq-with.js';

/**
 * @description Flatten one or multiple {@link ZodError} into an array of objects
 */
export function from_zod_error_to_error_response_objects(
  zod_error_or_errors: ZodError | ZodError[],
  type: ParamType
): ErrorResponseErrorObject[] {
  // Get all errors in an array of objects
  const errors = from_zod_error_to_error_response_objects_internal(
    zod_error_or_errors,
    type
  );
  // Filter only unique errors
  const unique_errors = uniq_with(
    errors,
    (error_a, error_b) =>
      error_a.path === error_b.path &&
      error_a.message === error_b.message &&
      error_a.type === error_b.type
  );
  // Group errors by the path
  const grouped_errors = group_to_map(unique_errors, (item) => item.path);
  const final_errors: ErrorResponseErrorObject[] = [];
  // Loop through all grouped errors and join their descriptions
  for (const [key, value] of grouped_errors) {
    final_errors.push({
      path: key,
      type,
      message: value.map((item) => item.message).join(' | '),
    });
  }
  return final_errors;
}

function from_zod_error_to_error_response_objects_internal(
  zodErrorOrErrors: ZodError | ZodError[],
  type: ParamType
): ErrorResponseErrorObject[] {
  const zod_errors = coerce_array(zodErrorOrErrors);
  const get_initial = (): ErrorResponseErrorObject[] => [];
  return zod_errors.reduce(
    (errorsLevel1, error) => [
      ...errorsLevel1,
      ...error.issues.reduce(
        (errorsLevel2, issue) => [
          ...errorsLevel2,
          ...from_zod_issue_to_error_response_object(issue, type),
        ],
        get_initial()
      ),
    ],
    get_initial()
  );
}

/**
 * @description Flatten a {@link ZodIssue} into an array of objects
 */
export function from_zod_issue_to_error_response_object(
  issue: ZodIssue,
  type: ParamType
): ErrorResponseErrorObject[] {
  const errors: ErrorResponseErrorObject[] = [
    {
      message: issue.message,
      type,
      path: from_zod_issue_path_to_string(issue.path),
    },
  ];
  switch (issue.code) {
    case ZodIssueCode.invalid_union: {
      errors.push(
        ...from_zod_error_to_error_response_objects_internal(
          issue.unionErrors,
          type
        )
      );
      break;
    }
    case ZodIssueCode.invalid_arguments: {
      errors.push(
        ...from_zod_error_to_error_response_objects_internal(
          issue.argumentsError,
          type
        )
      );
      break;
    }
    case ZodIssueCode.invalid_return_type: {
      errors.push(
        ...from_zod_error_to_error_response_objects_internal(
          issue.returnTypeError,
          type
        )
      );
      break;
    }
  }
  return errors;
}

/**
 * @description Transform a path array into a string
 * Example: ["config", "requests", 0, "name"] --> "config.requests[0].name"
 */
export function from_zod_issue_path_to_string(
  path: (string | number)[]
): string {
  return path.reduce((acc: string, item: string | number) => {
    if (typeof item === 'number') {
      return `${acc}[${item}]`;
    }
    return `${acc && acc + '.'}${item}`;
  }, '');
}
