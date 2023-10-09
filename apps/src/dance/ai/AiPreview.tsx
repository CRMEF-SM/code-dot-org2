import {BlockSvg} from 'blockly';
import React, {useCallback, useEffect, useRef} from 'react';
import ProgramExecutor from '../lab2/ProgramExecutor';
import moduleStyles from './ai-preview.module.scss';

interface AiPreviewProps {
  blocks: BlockSvg[];
}

const PREVIEW_DIV_ID = 'ai-preview';

/**
 * Previews the output of the AI block in Dance Party.
 */
const AiPreview: React.FunctionComponent<AiPreviewProps> = ({blocks}) => {
  // Generate setup code for previewing the given blocks.
  const generateSetupCode = useCallback((): string => {
    if (blocks.length === 0) {
      console.log('No blocks to preview');
      return '';
    }
    // Create a temporary setup block
    const setup: BlockSvg = Blockly.getMainWorkspace().newBlock(
      'Dancelab_whenSetup'
    ) as BlockSvg;

    // Attach the blocks to the setup block
    setup.getInput('DO')?.connection?.connect(blocks[0].previousConnection);

    if (!Blockly.getGenerator().isInitialized) {
      Blockly.getGenerator().init(Blockly.getMainWorkspace());
    }

    // Remove the temp setup block from the workspace so it doesn't remain after preview
    Blockly.getMainWorkspace().removeTopBlock(setup);
    return Blockly.getGenerator().blockToCode(setup);
  }, [blocks]);

  useEffect(() => {
    // Create a new program executor whenever preview code changes
    // to ensure that P5 is destroyed and reloaded correctly.
    const executor: ProgramExecutor = new ProgramExecutor(
      PREVIEW_DIV_ID,
      () => generateSetupCode(),
      () => undefined, // no-op on puzzle complete
      false, // isReadonly not used
      false // no replay log
    );
    executor.preview();
    return () => {
      executor.destroy();
    };
  }, [blocks, generateSetupCode]);

  const containerRef = useRef<HTMLDivElement>(null);

  // HACK: P5 Play hardcodes the canvas size to 400x400 no matter what the container
  // size is. This forces the canvas size to match the container size (200x200).
  useEffect(() => {
    if (containerRef.current) {
      const canvas = containerRef.current.children[0] as HTMLElement;
      if (canvas) {
        canvas.style.width = moduleStyles.previewSize;
        canvas.style.height = moduleStyles.previewSize;
      }
    }
  }, [containerRef]);

  return (
    <div
      id={PREVIEW_DIV_ID}
      className={moduleStyles.previewVisualization}
      ref={containerRef}
    />
  );
};

export default AiPreview;
