import { useNode } from "@/hooks/use-node";
import type { Node as NodeType } from "@/type/common";

export default function ({ node }: { node: NodeType }) {
  const {
    handleMouseDown, handleClick, handleDoubleClick, handleBlur, handleKeyDown,
    nodeRef, textareaRef, tempLabel, setTempLabel, isSelected, isEditing,
    nodeColorClass, selectedRingClass,
  } = useNode(node);

  return (
    <div
      ref={nodeRef}
      className={`
        absolute rounded-xl px-5 py-3 cursor-grab select-none active:cursor-grabbing
        font-semibold text-gray-800 shadow-md hover:shadow-xl
        transition duration-200 ease-in-out
        w-48 break-words text-center
        flex items-center justify-center
        ${nodeColorClass} ${selectedRingClass}
      `}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {node.data.label}

      {isEditing && (
        <textarea
          ref={textareaRef}
          value={tempLabel}
          onChange={(e) => setTempLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`
            absolute inset-0 w-full h-full border-none outline-none resize-none
            font-semibold text-gray-800 text-center
            px-5 py-3 leading-tight
            rounded-xl
            ${isSelected ? 'bg-purple-100' : 'bg-white'}
          `}
        />
      )}
    </div>
  );
}