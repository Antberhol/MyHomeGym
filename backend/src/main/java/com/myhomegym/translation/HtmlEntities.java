package com.myhomegym.translation;

final class HtmlEntities {

    private HtmlEntities() {
    }

    static String decode(String value) {
        return value
                .replace("&#39;", "'")
                .replace("&quot;", "\"")
                .replace("&lt;", "<")
                .replace("&gt;", ">")
                .replace("&amp;", "&");
    }
}
