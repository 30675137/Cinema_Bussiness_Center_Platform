package com.cinema.unitconversion.service;

import com.cinema.unitconversion.domain.UnitConversion;
import com.cinema.unitconversion.dto.ConversionPathResponse;
import com.cinema.unitconversion.dto.CycleValidationResponse;
import com.cinema.unitconversion.repository.UnitConversionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * 换算路径计算服务
 * - BFS 最短路径算法
 * - DFS 循环依赖检测
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConversionPathService {

    private final UnitConversionRepository repository;

    /**
     * 计算从源单位到目标单位的最短换算路径 (BFS)
     * 支持双向换算 (FR-008)
     */
    public ConversionPathResponse calculatePath(String fromUnit, String toUnit) {
        if (fromUnit.equals(toUnit)) {
            return ConversionPathResponse.found(fromUnit, toUnit, List.of(fromUnit), BigDecimal.ONE);
        }

        List<UnitConversion> conversions = repository.findAll();

        // 构建双向图
        Map<String, List<Edge>> graph = buildBidirectionalGraph(conversions);

        // BFS 查找最短路径
        Queue<PathNode> queue = new LinkedList<>();
        Set<String> visited = new HashSet<>();

        queue.offer(new PathNode(fromUnit, new ArrayList<>(List.of(fromUnit)), BigDecimal.ONE));

        while (!queue.isEmpty()) {
            PathNode current = queue.poll();

            if (current.unit.equals(toUnit)) {
                log.info("找到换算路径: {} → {}, 路径: {}, 换算率: {}",
                        fromUnit, toUnit, current.path, current.rate);
                return ConversionPathResponse.found(fromUnit, toUnit, current.path, current.rate);
            }

            if (visited.contains(current.unit)) {
                continue;
            }
            visited.add(current.unit);

            // 限制最大步骤数 (SC-003: 最多5个中间步骤)
            if (current.path.size() > 6) {
                continue;
            }

            List<Edge> neighbors = graph.getOrDefault(current.unit, Collections.emptyList());
            for (Edge edge : neighbors) {
                if (!visited.contains(edge.toUnit)) {
                    List<String> newPath = new ArrayList<>(current.path);
                    newPath.add(edge.toUnit);
                    BigDecimal newRate = current.rate.multiply(edge.rate);
                    queue.offer(new PathNode(edge.toUnit, newPath, newRate));
                }
            }
        }

        log.info("未找到换算路径: {} → {}", fromUnit, toUnit);
        return ConversionPathResponse.notFound(fromUnit, toUnit);
    }

    /**
     * 验证循环依赖 (DFS + 路径追踪)
     * FR-003: 创建/编辑时实时检测循环依赖
     */
    public CycleValidationResponse validateCycle(String fromUnit, String toUnit, UUID excludeId) {
        List<UnitConversion> conversions = repository.findAll();

        // 构建图（排除指定ID的规则）
        Map<String, List<String>> graph = new HashMap<>();
        for (UnitConversion c : conversions) {
            if (excludeId != null && excludeId.equals(c.getId())) {
                continue;
            }
            graph.computeIfAbsent(c.getFromUnit(), k -> new ArrayList<>()).add(c.getToUnit());
        }

        // 添加新边
        graph.computeIfAbsent(fromUnit, k -> new ArrayList<>()).add(toUnit);

        // DFS 检测循环
        Set<String> visited = new HashSet<>();
        List<String> path = new ArrayList<>();

        List<String> cycle = detectCycleDFS(fromUnit, graph, visited, path);

        if (cycle != null) {
            log.warn("检测到循环依赖: {}", cycle);
            return CycleValidationResponse.cycleDetected(cycle);
        }

        return CycleValidationResponse.valid();
    }

    /**
     * DFS 检测循环
     */
    private List<String> detectCycleDFS(String node, Map<String, List<String>> graph,
                                         Set<String> visited, List<String> path) {
        if (path.contains(node)) {
            // 找到循环，返回循环路径
            int cycleStart = path.indexOf(node);
            List<String> cycle = new ArrayList<>(path.subList(cycleStart, path.size()));
            cycle.add(node);
            return cycle;
        }

        if (visited.contains(node)) {
            return null;
        }

        visited.add(node);
        path.add(node);

        List<String> neighbors = graph.getOrDefault(node, Collections.emptyList());
        for (String neighbor : neighbors) {
            List<String> cycle = detectCycleDFS(neighbor, graph, visited, path);
            if (cycle != null) {
                return cycle;
            }
        }

        path.remove(path.size() - 1);
        return null;
    }

    /**
     * 构建双向图（支持反向换算）
     */
    private Map<String, List<Edge>> buildBidirectionalGraph(List<UnitConversion> conversions) {
        Map<String, List<Edge>> graph = new HashMap<>();

        for (UnitConversion c : conversions) {
            // 正向边
            graph.computeIfAbsent(c.getFromUnit(), k -> new ArrayList<>())
                    .add(new Edge(c.getToUnit(), c.getConversionRate()));

            // 反向边 (1/rate)
            BigDecimal reverseRate = BigDecimal.ONE.divide(c.getConversionRate(), 10, RoundingMode.HALF_UP);
            graph.computeIfAbsent(c.getToUnit(), k -> new ArrayList<>())
                    .add(new Edge(c.getFromUnit(), reverseRate));
        }

        return graph;
    }

    /**
     * 图的边
     */
    private record Edge(String toUnit, BigDecimal rate) {}

    /**
     * BFS 路径节点
     */
    private record PathNode(String unit, List<String> path, BigDecimal rate) {}
}
