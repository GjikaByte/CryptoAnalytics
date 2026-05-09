package andi.cryptoanalytics.repositories;

import andi.cryptoanalytics.entities.Crypto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface CryptoRepository extends JpaRepository<Crypto, String> {

    Optional<Crypto> findBySymbol(String symbol);
    List<Crypto> findAllBySymbolIn(Collection<String> symbols);
    boolean existsBySymbol(String symbol);

}