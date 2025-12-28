/**
 * @spec O003-beverage-order
 * 饮品Entity和DTO映射器 (User Story 3)
 */
package com.cinema.beverage.mapper;

import com.cinema.beverage.dto.*;
import com.cinema.beverage.entity.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 饮品Entity和DTO相互转换的映射器
 */
@Component
public class BeverageMapper {

    /**
     * Beverage Entity -> BeverageDTO
     */
    public BeverageDTO toDTO(Beverage beverage) {
        if (beverage == null) {
            return null;
        }

        BeverageDTO dto = new BeverageDTO();
        dto.setId(beverage.getId().toString());
        dto.setName(beverage.getName());
        dto.setCategory(beverage.getCategory());
        // 转换价格：元 -> 分
        dto.setBasePrice(beverage.getBasePrice().multiply(new BigDecimal("100")).longValue());
        dto.setDescription(beverage.getDescription());
        dto.setMainImage(beverage.getImageUrl());
        dto.setStatus(beverage.getStatus());
        dto.setCreatedAt(beverage.getCreatedAt() != null ? beverage.getCreatedAt().toString() : null);
        dto.setUpdatedAt(beverage.getUpdatedAt() != null ? beverage.getUpdatedAt().toString() : null);
        dto.setCreatedBy(beverage.getCreatedBy() != null ? beverage.getCreatedBy().toString() : null);
        dto.setUpdatedBy(beverage.getUpdatedBy() != null ? beverage.getUpdatedBy().toString() : null);
        dto.setIsRecommended(beverage.getIsRecommended());
        dto.setSortOrder(beverage.getSortOrder());

        // 规格和配方数量需要在Service层设置
        dto.setSpecCount(0);
        dto.setRecipeCount(0);

        return dto;
    }

    /**
     * BeverageSpec Entity -> BeverageSpecDTO
     */
    public BeverageSpecDTO toSpecDTO(BeverageSpec spec) {
        if (spec == null) {
            return null;
        }

        BeverageSpecDTO dto = new BeverageSpecDTO();
        dto.setId(spec.getId().toString());
        dto.setBeverageId(spec.getBeverageId().toString());
        dto.setSpecType(spec.getSpecType());
        dto.setName(spec.getSpecName());
        // 转换价格：元 -> 分
        dto.setPriceAdjustment(spec.getPriceAdjustment().multiply(new BigDecimal("100")).longValue());
        dto.setIsDefault(spec.getIsDefault());
        dto.setSortOrder(spec.getSortOrder());
        dto.setCreatedAt(java.time.LocalDateTime.now().toString()); // TODO: 从Entity获取
        dto.setUpdatedAt(java.time.LocalDateTime.now().toString());

        return dto;
    }

    /**
     * BeverageRecipe Entity + Ingredients -> BeverageRecipeDTO
     */
    public BeverageRecipeDTO toRecipeDTO(BeverageRecipe recipe, List<RecipeIngredient> ingredients) {
        if (recipe == null) {
            return null;
        }

        BeverageRecipeDTO dto = new BeverageRecipeDTO();
        dto.setId(recipe.getId().toString());
        dto.setBeverageId(recipe.getBeverageId().toString());
        dto.setName(recipe.getName());
        dto.setApplicableSpecs(recipe.getApplicableSpecs());
        dto.setDescription(recipe.getDescription());
        dto.setCreatedAt(recipe.getCreatedAt().toString());
        dto.setUpdatedAt(recipe.getUpdatedAt().toString());

        if (ingredients != null) {
            dto.setIngredients(ingredients.stream()
                .map(this::toRecipeIngredientDTO)
                .collect(Collectors.toList()));
        }

        return dto;
    }

    /**
     * RecipeIngredient Entity -> RecipeIngredientDTO
     */
    public BeverageRecipeDTO.RecipeIngredientDTO toRecipeIngredientDTO(RecipeIngredient ingredient) {
        if (ingredient == null) {
            return null;
        }

        BeverageRecipeDTO.RecipeIngredientDTO dto = new BeverageRecipeDTO.RecipeIngredientDTO();
        dto.setId(ingredient.getId().toString());
        dto.setSkuId(ingredient.getSkuId().toString()); // UUID 转字符串
        dto.setIngredientName(ingredient.getIngredientName());
        dto.setQuantity(ingredient.getQuantity().doubleValue());
        dto.setUnit(ingredient.getUnit());
        dto.setNote(ingredient.getNote());
        // stockStatus 需要在Service层通过调用P003 API填充

        return dto;
    }

    /**
     * List<Beverage> -> List<BeverageDTO>
     */
    public List<BeverageDTO> toDTOList(List<Beverage> beverages) {
        if (beverages == null) {
            return List.of();
        }
        return beverages.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * List<BeverageSpec> -> List<BeverageSpecDTO>
     */
    public List<BeverageSpecDTO> toSpecDTOList(List<BeverageSpec> specs) {
        if (specs == null) {
            return List.of();
        }
        return specs.stream()
            .map(this::toSpecDTO)
            .collect(Collectors.toList());
    }
}
