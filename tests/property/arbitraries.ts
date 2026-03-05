/**
 * Arbitrary generators for property-based testing with fast-check.
 */

import * as fc from 'fast-check';
import type {
  AccessibleNode,
  AccessibleRole,
  AccessibleState,
  AccessibleValue,
  AnnouncementModel,
  FocusInfo,
  ModelVersion,
} from '../../src/model/types.js';
import { SUPPORTED_ROLES } from '../../src/model/types.js';

/**
 * Generate arbitrary ModelVersion.
 */
export const arbitraryModelVersion = (): fc.Arbitrary<ModelVersion> => {
  return fc.record({
    major: fc.constant(1),
    minor: fc.constant(0),
  });
};

/**
 * Generate arbitrary AccessibleRole.
 */
export const arbitraryAccessibleRole = (): fc.Arbitrary<AccessibleRole> => {
  return fc.constantFrom(...SUPPORTED_ROLES);
};

/**
 * Generate arbitrary AccessibleState.
 */
export const arbitraryAccessibleState = (): fc.Arbitrary<AccessibleState> => {
  return fc.record(
    {
      expanded: fc.option(fc.boolean()),
      checked: fc.option(fc.oneof(fc.boolean(), fc.constant('mixed' as const))),
      pressed: fc.option(fc.oneof(fc.boolean(), fc.constant('mixed' as const))),
      selected: fc.option(fc.boolean()),
      disabled: fc.option(fc.boolean()),
      invalid: fc.option(fc.boolean()),
      required: fc.option(fc.boolean()),
      readonly: fc.option(fc.boolean()),
      busy: fc.option(fc.boolean()),
      current: fc.option(
        fc.constantFrom('page', 'step', 'location', 'date', 'time', 'true', false as const)
      ),
      grabbed: fc.option(fc.boolean()),
      hidden: fc.option(fc.boolean()),
      level: fc.option(fc.integer({ min: 1, max: 6 })),
      posinset: fc.option(fc.integer({ min: 1, max: 100 })),
      setsize: fc.option(fc.integer({ min: 1, max: 100 })),
    },
    { requiredKeys: [] }
  );
};

/**
 * Generate arbitrary AccessibleValue.
 */
export const arbitraryAccessibleValue = (): fc.Arbitrary<AccessibleValue> => {
  return fc.record({
    current: fc.oneof(
      fc.string({ minLength: 0, maxLength: 100 }),
      fc.integer({ min: 0, max: 1000 })
    ),
    min: fc.option(fc.integer({ min: 0, max: 100 })),
    max: fc.option(fc.integer({ min: 0, max: 1000 })),
    text: fc.option(fc.string({ maxLength: 100 })),
  });
};

/**
 * Generate arbitrary FocusInfo.
 */
export const arbitraryFocusInfo = (): fc.Arbitrary<FocusInfo> => {
  return fc.record({
    focusable: fc.boolean(),
    tabindex: fc.option(fc.integer({ min: -1, max: 100 })),
  });
};

/**
 * Generate arbitrary AccessibleNode with limited depth to avoid stack overflow.
 */
export const arbitraryAccessibleNode = (
  depth: number = 0
): fc.Arbitrary<AccessibleNode> => {
  const maxDepth = 3;
  const maxChildren = depth >= maxDepth ? 0 : 3;

  return fc.record({
    role: arbitraryAccessibleRole(),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.option(fc.string({ maxLength: 200 })),
    value: fc.option(arbitraryAccessibleValue()),
    state: arbitraryAccessibleState(),
    focus: arbitraryFocusInfo(),
    children: fc.array(
      fc.constant(null).chain(() => arbitraryAccessibleNode(depth + 1)),
      { maxLength: maxChildren }
    ),
  });
};

/**
 * Generate arbitrary AnnouncementModel.
 */
export const arbitraryAnnouncementModel = (): fc.Arbitrary<AnnouncementModel> => {
  return fc.record({
    version: arbitraryModelVersion(),
    root: arbitraryAccessibleNode(),
    metadata: fc.record({
      extractedAt: fc.date().map((d) => d.toISOString()),
      sourceHash: fc.option(fc.hexaString({ minLength: 32, maxLength: 64 })),
    }),
  });
};
