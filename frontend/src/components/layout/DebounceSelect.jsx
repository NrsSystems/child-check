import React, { useMemo, useRef, useState } from "react";
import { Select, Spin } from "antd";
import debounce from "lodash/debounce";

export default function DebounceSelect({
  fetchOptions,
  debounceTimeout = 500,
  single = false,
  onChange,
  ...props
}) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const [value, setValue] = useState(null);
  const fetchRef = useRef(0);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  const handleChange = (val) => {
    if (single) {
      if (val.length > 0) {
        val = val.pop();
        setValue([val]);
        onChange([val]);
      } else {
        setValue(null);
        onChange(null);
      }
    } else {
      setValue(val);
      onChange(val);
    }
  };

  return (
    <Select
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
      options={options}
      value={value}
      onChange={handleChange}
    />
  );
}
