"use client"
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { BlockEditor } from "@/components/Editor"; 
import { useCheckCharacter} from '../../hooks'

 
export const PaenelPreview = React.memo(() => {
  const { checkCharacter } = useCheckCharacter();

  // checkCharacter
  const checkBlockEditorValue = React.useMemo(() => {
    return checkCharacter.doc;
  }, [checkCharacter]);

  if (!checkBlockEditorValue) {
    return null;
  }

  return (
    <ScrollArea className="h-[70vh] sm:h-[75vh] md:h-[80vh] w-full sm:w-[31rem] md:w-[37rem] lg:w-[40rem]">
        {/* @ts-ignore */}
        <BlockEditor content={checkBlockEditorValue} editable={false} />
      </ScrollArea>
  );
});