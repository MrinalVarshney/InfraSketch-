type TagType = { [key: string]: string };

type TagsBlockProps = {
  tags: TagType;
  setTags: (tags: TagType) => void;
};

export default function TagsBlock({ tags, setTags }: TagsBlockProps) {
  const handleChangeKey = (oldKey: string, newKey: string) => {
    const updated = { ...tags };
    const value = updated[oldKey];
    delete updated[oldKey];
    updated[newKey] = value;
    setTags(updated);
  };

  const handleChangeValue = (key: string, value: string) => {
    setTags({ ...tags, [key]: value });
  };

  const addTag = () => {
    setTags({ ...tags, "": "" });
  };

  const removeTag = (key: string) => {
    const updated = { ...tags };
    delete updated[key];
    setTags(updated);
  };

  return (
    <div className="space-y-2 p-3 border rounded bg-gray-50 w-full max-w-md text-sm">
      <div className="font-medium">Tags</div>

      {Object.entries(tags).map(([key, value], i) => (
        <div key={i} className="flex items-center gap-1">
          <input
            className="border rounded px-2 py-1 w-1/3 text-sm"
            placeholder="Key"
            value={key}
            onChange={(e) => handleChangeKey(key, e.target.value)}
          />
          <input
            className="border rounded px-2 py-1 w-1/2 text-sm"
            placeholder="Value"
            value={value}
            onChange={(e) => handleChangeValue(key, e.target.value)}
          />
          {Object.keys(tags).length > 1 && (
            <button
              className="text-red-500 text-xs px-2 hover:underline"
              onClick={() => removeTag(key)}
            >
              ✕
            </button>
          )}
        </div>
      ))}

      <button
        onClick={addTag}
        className="text-blue-500 text-xs hover:underline"
      >
        + Add Tag
      </button>
    </div>
  );
}
