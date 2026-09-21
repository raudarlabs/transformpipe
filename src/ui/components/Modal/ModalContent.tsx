'use client';

import * as ModalPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ComponentProps, ComponentPropsWithRef } from 'react';

import { cn } from '../../lib/utils';
import { DialogTitleFallback } from '../DialogTitleFallback';
import { IconButton } from '../IconButton';
import { ModalClose } from './ModalClose';
import { ModalOverlay } from './ModalOverlay';
import { ModalPortal } from './ModalPortal';

interface ModalContentProps
  extends ComponentPropsWithRef<typeof ModalPrimitive.Content> {
  isCloseButtonVisible?: boolean;
  closeButtonProps?: ComponentProps<typeof IconButton>;
}

export function ModalContent({
  ref,
  className,
  children,
  isCloseButtonVisible = true,
  closeButtonProps,
  ...props
}: ModalContentProps) {
  return (
    <ModalPortal>
      <ModalOverlay />
      <ModalPrimitive.Content
        ref={ref}
        aria-describedby={undefined}
        className={cn(
          /*
           * The cap needs something to do when the content is taller than it.
           *
           * `max-h-[90dvh]` was here from the start and it is the right cap; what was missing is
           * that nothing scrolled once it bit. Turn a phone sideways and the viewport is 375
           * pixels tall: the sign-in dialog was capped at 337 with 124 pixels of itself below
           * the fold, `overflow: hidden`, and no way to reach them. Every dialog in this app is
           * this component, so every one of them had it.
           *
           * The scroll goes here rather than on a wrapper inside, which was tried first and
           * measured: a `flex-1 min-h-0` child of a container whose height is clamped by
           * `max-height` rather than set is not itself clamped — it laid out at its natural 870
           * pixels and was simply clipped, exactly as before. The close button below scrolls
           * with the content as a result; Escape and a tap outside both still close, so what
           * changes is where the button is, not whether there is a way out.
           */
          'flex max-h-[90dvh] max-w-lg flex-col overflow-y-auto',
          'fixed top-1/2 left-1/2 z-[100] w-[calc(100%-1.5rem)] -translate-x-1/2 -translate-y-1/2',
          'rounded-lg',
          'border border-stroke',
          'bg-surface-card p-4 shadow-lg duration-200',

          // Closed state
          'data-[state=closed]:fade-out-0',
          'data-[state=closed]:slide-out-to-left-1/2',
          'data-[state=closed]:zoom-out-95',
          'data-[state=closed]:slide-out-to-top-[48%]',
          'data-[state=closed]:animate-out',

          // Opened state
          'data-[state=open]:fade-in-0',
          'data-[state=open]:zoom-in-95',
          'data-[state=open]:slide-in-from-left-1/2',
          'data-[state=open]:slide-in-from-top-[48%]',
          'data-[state=open]:animate-in',
          className
        )}
        {...props}
      >
        {children}
        <DialogTitleFallback>{props['aria-label']}</DialogTitleFallback>
        {isCloseButtonVisible && (
          <ModalClose asChild>
            <IconButton
              variant="transparent"
              size="md"
              rounded="full"
              className={cn('absolute top-4 right-4 max-h-fit max-w-fit')}
              {...closeButtonProps}
            >
              <X className="text-ink-body" />
              <span className="sr-only">Close</span>
            </IconButton>
          </ModalClose>
        )}
      </ModalPrimitive.Content>
    </ModalPortal>
  );
}

ModalContent.displayName = 'ModalContent';
