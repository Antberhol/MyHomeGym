package com.myhomegym.translation;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Pasa a "tú" las traducciones automáticas al español (RN-5.13). Los traductores mezclan "tú" y
 * "usted" ("Coloca los pies… Mantenga la espalda recta"), y la app trata siempre de tú.
 *
 * <p>Cambia palabras completas de una lista cerrada: los imperativos de usted más usados en
 * instrucciones de ejercicios (también con pronombre: "colóquese", "levántelo"), "usted" y los
 * posesivos "su"/"sus" cuando van delante de una parte del cuerpo o de la postura. Se dejan fuera las
 * formas que también son sustantivos o adjetivos ("agarre", "ajuste", "doble", "avance") o que
 * significan otra cosa ("se sienta"). No toca nada más: lo que no está en la lista se queda como venía.
 */
final class SpanishRegister {

    private SpanishRegister() {
    }

    /** Imperativo de usted → imperativo de tú. */
    private static final Map<String, String> WORDS = new HashMap<>();

    /** Partes del cuerpo y de la postura tras las que "su"/"sus" se refieren a quien entrena. */
    private static final List<String> BODY = List.of("espalda", "brazo", "brazos", "pierna", "piernas", "pie", "pies",
            "mano", "manos", "codo", "codos", "rodilla", "rodillas", "hombro", "hombros", "cabeza", "cuerpo", "torso",
            "pecho", "cadera", "caderas", "abdomen", "abdominales", "glúteos", "muñeca", "muñecas", "tobillo",
            "tobillos", "cuello", "mirada", "peso", "core", "columna", "muslo", "muslos", "pantorrilla", "pantorrillas",
            "dedos", "palmas", "antebrazo", "antebrazos", "tríceps", "bíceps", "posición", "agarre", "respiración",
            "lado", "costado", "tronco", "pelvis", "talones", "omóplatos", "escápulas", "barbilla", "mentón");

    static {
        String[][] pairs = {
                { "coloque", "coloca" }, { "mantenga", "mantén" }, { "levante", "levanta" }, { "baje", "baja" },
                { "sostenga", "sostén" }, { "repita", "repite" },                 { "empuje", "empuja" }, { "tire", "tira" }, { "gire", "gira" }, { "exhale", "exhala" },
                { "inhale", "inhala" }, { "respire", "respira" }, { "vuelva", "vuelve" }, { "comience", "comienza" },
                { "empiece", "empieza" }, { "haga", "haz" }, { "lleve", "lleva" }, { "mueva", "mueve" },
                { "extienda", "extiende" }, { "flexione", "flexiona" }, { "contraiga", "contrae" },
                { "apriete", "aprieta" }, { "utilice", "utiliza" }, { "sujete", "sujeta" }, { "tome", "toma" },
                { "incline", "inclina" }, { "evite", "evita" }, { "estire", "estira" },
                { "eleve", "eleva" }, { "suba", "sube" }, { "bloquee", "bloquea" }, { "cruce", "cruza" },
                { "abra", "abre" }, { "cierre", "cierra" }, { "separe", "separa" }, { "junte", "junta" },
                { "apoye", "apoya" }, { "presione", "presiona" }, { "deje", "deja" }, { "permita", "permite" },
                { "continúe", "continúa" }, { "termine", "termina" }, { "alterne", "alterna" }, { "cambie", "cambia" },
                { "camine", "camina" }, { "salte", "salta" }, { "detenga", "detén" }, { "ponga", "pon" },
                { "sitúe", "sitúa" }, { "ubique", "ubica" }, { "posicione", "posiciona" }, { "asegure", "asegura" },
                { "concentre", "concentra" }, { "rote", "rota" }, { "arquee", "arquea" },
                { "redondee", "redondea" }, { "retraiga", "retrae" }, { "relaje", "relaja" }, { "mire", "mira" },
                { "pise", "pisa" }, { "retroceda", "retrocede" }, { "descienda", "desciende" },
                { "regrese", "regresa" }, { "realice", "realiza" }, { "ejecute", "ejecuta" }, { "siga", "sigue" },
                { "dé", "da" }, { "agáchese", "agáchate" }, { "colóquese", "colócate" }, { "siéntese", "siéntate" },
                { "acuéstese", "acuéstate" }, { "recuéstese", "recuéstate" }, { "túmbese", "túmbate" },
                { "párese", "párate" }, { "póngase", "ponte" }, { "inclínese", "inclínate" },
                { "arrodíllese", "arrodíllate" }, { "asegúrese", "asegúrate" }, { "manténgase", "mantente" },
                { "deténgase", "detente" }, { "vuélvase", "vuélvete" }, { "gírese", "gírate" },
                { "estírese", "estírate" }, { "relájese", "relájate" }, { "apóyese", "apóyate" },
                { "colóquelo", "colócalo" }, { "colóquela", "colócala" }, { "levántelo", "levántalo" },
                { "levántela", "levántala" }, { "bájelo", "bájalo" }, { "bájela", "bájala" }, { "súbalo", "súbelo" },
                { "súbala", "súbela" }, { "sosténgalo", "sostenlo" }, { "sosténgala", "sostenla" },
                { "manténgalo", "mantenlo" }, { "manténgala", "mantenla" }, { "sujételo", "sujétalo" },
                { "sujétela", "sujétala" }, { "agárrelo", "agárralo" }, { "agárrela", "agárrala" },
                { "empújelo", "empújalo" }, { "empújela", "empújala" }, { "tírelo", "tíralo" }, { "tírela", "tírala" },
                { "llévelo", "llévalo" }, { "llévela", "llévala" }, { "hágalo", "hazlo" }, { "repítalo", "repítelo" },
                { "usted", "tú" },
        };
        for (String[] pair : pairs) {
            WORDS.put(pair[0], pair[1]);
        }
    }

    private static final Pattern WORD = Pattern.compile("\\p{L}+", Pattern.UNICODE_CHARACTER_CLASS);
    private static final Pattern POSSESSIVE = Pattern.compile(
            "\\b([Ss]u)(s?)\\s+(" + String.join("|", BODY) + ")\\b", Pattern.UNICODE_CHARACTER_CLASS);

    static String toTu(String text) {
        if (text == null || text.isBlank()) {
            return text;
        }
        Matcher words = WORD.matcher(text);
        StringBuilder out = new StringBuilder();
        while (words.find()) {
            String word = words.group();
            String replacement = WORDS.get(word.toLowerCase(Locale.ROOT));
            words.appendReplacement(out, Matcher.quoteReplacement(replacement == null ? word : sameCase(word, replacement)));
        }
        words.appendTail(out);

        Matcher possessive = POSSESSIVE.matcher(out.toString());
        StringBuilder result = new StringBuilder();
        while (possessive.find()) {
            String tu = possessive.group(1).charAt(0) == 'S' ? "Tu" : "tu";
            possessive.appendReplacement(result,
                    Matcher.quoteReplacement(tu + possessive.group(2) + " " + possessive.group(3)));
        }
        possessive.appendTail(result);
        return result.toString();
    }

    private static String sameCase(String original, String replacement) {
        if (Character.isUpperCase(original.charAt(0))) {
            return Character.toUpperCase(replacement.charAt(0)) + replacement.substring(1);
        }
        return replacement;
    }
}
