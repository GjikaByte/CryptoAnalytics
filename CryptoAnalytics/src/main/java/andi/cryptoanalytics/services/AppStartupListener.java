package andi.cryptoanalytics.services;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AppStartupListener implements ApplicationListener<ApplicationReadyEvent> {

    private final CryptoService cryptoService;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        cryptoService.init();
    }
}
