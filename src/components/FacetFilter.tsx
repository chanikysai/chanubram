import React, { useState, useEffect } from 'react';
import { Facet, FacetOption, Product } from '../types/search';
import './FacetFilter.css';

interface FacetFilterProps {
  facets: Facet[];
  currentFilters: Record<string, any>;
  onFilterChange: (newFilters: Record<string, any>) => void;
}

const FacetFilter: React.FC<FacetFilterProps> = ({ facets, currentFilters, onFilterChange }) => {
  const [expandedFacets, setExpandedFacets] = useState<Set<string>>(new Set());

  // Initialize expandedFacets based on the facets prop
  useEffect(() => {
    facets.forEach(facet => {
      if (!expandedFacets.has(facet.field)) {
        setExpandedFacets(prev => new Set(prev).add(facet.field));
      }
    });
  }, [facets]);

  const toggleFacet = (field: string) => {
    setExpandedFacets(prev => {
      const next = new Set(prev);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  };

  const handleCheckboxChange = (facetField: string, optionValue: string, isChecked: boolean) => {
    const newFilters = { ...currentFilters };
    if (!newFilters[facetField]) {
      newFilters[facetField] = [];
    }

    if (isChecked) {
      if (!newFilters[facetField].includes(optionValue)) {
        newFilters[facetField] = [...newFilters[facetField], optionValue];
      }
    } else {
      newFilters[facetField] = newFilters[facetField].filter((item: string) => item !== optionValue);
      if (newFilters[facetField].length === 0) {
        delete newFilters[facetField]; // Remove filter if no options are selected
      }
    }
    onFilterChange(newFilters);
  };

  const handleRangeChange = (facetField: string, range: [number, number]) => {
    const newFilters = { ...currentFilters };
    newFilters[facetField] = range;
    onFilterChange(newFilters);
  };

  const renderFacetOptions = (facet: Facet) => {
    if (!facet.options || facet.options.length === 0) {
      return <p className="facet-filter__no-options">No options available</p>;
    }

    switch (facet.type) {
      case 'checkbox':
        return (
          <div className="facet-filter__options">
            {facet.options.map((option: FacetOption) => {
              const isSelected = currentFilters[facet.field]?.includes(option.value) || false;
              return (
                <div key={option.value} className="facet-filter__option">
                  <input
                    type="checkbox"
                    id={`${facet.field}-${option.value}`}
                    checked={isSelected}
                    onChange={(e) => handleCheckboxChange(facet.field, option.value, e.target.checked)}
                  />
                  <label htmlFor={`${facet.field}-${option.value}`}>
                    {option.value} ({option.count})
                  </label>
                </div>
              );
            })}
          </div>
        );

      case 'range':
        // For simplicity, we'll use input fields for min/max. A slider would be more sophisticated.
        const currentRange = currentFilters[facet.field] || [facet.min, facet.max];
        const min = facet.min ?? 0;
        const max = facet.max ?? 1000; // Default max if not provided

        const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const newMin = parseInt(e.target.value, 10);
          if (!isNaN(newMin)) {
            handleRangeChange(facet.field, [Math.min(newMin, currentRange[1]), currentRange[1]]);
          }
        };

        const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const newMax = parseInt(e.target.value, 10);
          if (!isNaN(newMax)) {
            handleRangeChange(facet.field, [currentRange[0], Math.max(newMax, currentRange[0])]);
          }
        };

        return (
          <div className="facet-filter__range-inputs">
            <input
              type="number"
              value={currentRange[0]}
              min={min}
              max={max}
              onChange={handleMinInputChange}
              placeholder={`Min ($${min})`}
              className="facet-filter__range-input"
            />
            <span>-</span>
            <input
              type="number"
              value={currentRange[1]}
              min={min}
              max={max}
              onChange={handleMaxInputChange}
              placeholder={`Max ($${max})`}
              className="facet-filter__range-input"
            />
          </div>
        );
      // Add case for 'dropdown' if needed, though checkboxes cover similar use cases for multiple selections.
      default:
        return null;
    }
  };

  return (
    <div className="facet-filter">
      <h3 className="facet-filter__title">Filters</h3>
      {facets.map(facet => (
        <div key={facet.field} className="facet-filter__item">
          <div className="facet-filter__header" onClick={() => toggleFacet(facet.field)}>
            <h4>{facet.label}</h4>
            <span>{expandedFacets.has(facet.field) ? '-' : '+'}</span>
          </div>
          {expandedFacets.has(facet.field) && renderFacetOptions(facet)}
        </div>
      ))}
    </div>
  );
};

export default FacetFilter;

