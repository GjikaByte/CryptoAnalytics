package andi.cryptoanalytics.DTOs;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.Instant;

@Data
public class CryptoDTO {

    private String id;
    private String symbol;
    private String name;

    @JsonProperty("current_price")
    private Double currentPrice;

    @JsonProperty("market_cap")
    private Long marketCap;

    @JsonProperty("market_cap_rank")
    private Integer marketCapRank;

    @JsonProperty("fully_diluted_valuation")
    private Long fullyDilutedValuation;

    @JsonProperty("total_volume")
    private Long totalVolume;

    @JsonProperty("high_24h")
    private Double high24h;

    @JsonProperty("low_24h")
    private Double low24h;

    @JsonProperty("price_change_24h")
    private Double priceChange24h;

    @JsonProperty("price_change_percentage_24h")
    private Double priceChangePercentage24h;

    @JsonProperty("market_cap_change_24h")
    private Long marketCapChange24h;

    @JsonProperty("market_cap_change_percentage_24h")
    private Double marketCapChangePercentage24h;

    @JsonProperty("circulating_supply")
    private Double circulatingSupply;

    @JsonProperty("total_supply")
    private Double totalSupply;

    @JsonProperty("max_supply")
    private Double maxSupply;

    private Double ath;

    @JsonProperty("ath_change_percentage")
    private Double athChangePercentage;

    @JsonProperty("ath_date")
    private Instant athDate;

    private Double atl;

    @JsonProperty("atl_change_percentage")
    private Double atlChangePercentage;

    @JsonProperty("atl_date")
    private Instant atlDate;

    private Roi roi;

    @JsonProperty("last_updated")
    private Instant lastUpdated;

    @Data
    public static class Roi {
        private Double times;
        private String currency;
        private Double percentage;
    }
}