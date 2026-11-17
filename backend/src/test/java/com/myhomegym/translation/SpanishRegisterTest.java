package com.myhomegym.translation;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/** Las traducciones al español tratan siempre de tú (RN-5.13). */
class SpanishRegisterTest {

    @Test
    void mixedInstructionsEndUpInTu() {
        String mixed = "Coloca los pies a la anchura de los hombros. Mantenga su espalda recta y colóquese debajo "
                + "de la barra. Bájela despacio y asegúrese de que sus rodillas no pasen de la punta de los pies.";
        assertThat(SpanishRegister.toTu(mixed)).isEqualTo("Coloca los pies a la anchura de los hombros. Mantén tu "
                + "espalda recta y colócate debajo de la barra. Bájala despacio y asegúrate de que tus rodillas no "
                + "pasen de la punta de los pies.");
    }

    @Test
    void leavesNounsAndTextAlreadyInTuUntouched() {
        String ok = "Usa un agarre prono con un ajuste doble. La barra se sienta en su soporte. Sostén la posición.";
        assertThat(SpanishRegister.toTu(ok)).isEqualTo(ok);
    }

    @Test
    void appliesOnlyToSpanishAndToCachedTranslationsToo() {
        assertThat(TranslationService.register("Levante su pecho.", "es")).isEqualTo("Levanta tu pecho.");
        assertThat(TranslationService.register("Levante su pecho.", "en")).isEqualTo("Levante su pecho.");
    }
}
