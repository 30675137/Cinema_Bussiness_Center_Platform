package com.cinema.unitconversion.dto;

import lombok.*;

/**
 * 换算统计响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversionStatsResponse {
    private int volumeCount;
    private int weightCount;
    private int countCount;
    private int totalCount;

    /**
     * 创建统计响应
     */
    public static ConversionStatsResponse of(int volumeCount, int weightCount, int countCount) {
        return ConversionStatsResponse.builder()
                .volumeCount(volumeCount)
                .weightCount(weightCount)
                .countCount(countCount)
                .totalCount(volumeCount + weightCount + countCount)
                .build();
    }
}
