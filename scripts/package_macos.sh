#!/bin/zsh
set -euo pipefail

repo_dir="${0:A:h:h}"
universal_app="$repo_dir/src-tauri/target/universal-apple-darwin/release/bundle/macos/JMeca.app"
native_app="$repo_dir/src-tauri/target/release/bundle/macos/JMeca.app"
out="$repo_dir/dist/installers"

if [[ -d "$universal_app" ]]; then
  app="$universal_app"
  architecture="Universal"
  archs=$(lipo -archs "$app/Contents/MacOS/jmeca")
  if [[ " $archs " != *" arm64 "* || " $archs " != *" x86_64 "* ]]; then
    print -u2 "Le binaire macOS annoncé universel ne contient pas les deux architectures : $archs"
    exit 1
  fi
elif [[ -d "$native_app" ]]; then
  app="$native_app"
  archs=$(lipo -archs "$app/Contents/MacOS/jmeca")
  case "$archs" in
    arm64) architecture="Apple-Silicon" ;;
    x86_64) architecture="Intel" ;;
    *) print -u2 "Architecture macOS non reconnue : $archs"; exit 1 ;;
  esac
else
  print -u2 "JMeca.app introuvable. Lancez d'abord npm run desktop:build -- --bundles app."
  exit 1
fi

version=$(/usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$app/Contents/Info.plist")
if [[ ! "$version" =~ '^[0-9]+\.[0-9]+\.[0-9]+$' ]]; then
  print -u2 "Version de l'application invalide."
  exit 1
fi

mkdir -p "$out"
stage=$(mktemp -d "${TMPDIR:-/tmp/}jmeca-package.XXXXXX")
trap 'rm -rf "$stage"' EXIT

# La signature locale vérifie l'intégrité des ressources. Elle n'est pas une
# signature Developer ID et ne remplace pas la notarisation Apple.
codesign --force --deep --sign - "$app"
codesign --verify --deep --strict "$app"

mkdir -p "$stage/dmg" "$stage/pkgroot/Applications"
ditto "$app" "$stage/dmg/JMeca.app"
ditto "$app" "$stage/pkgroot/Applications/JMeca.app"
ln -s /Applications "$stage/dmg/Applications"
cat > "$stage/dmg/Lisez-moi.txt" <<'TXT'
JMeca — installation sur macOS

Glissez JMeca.app sur le dossier Applications, puis ouvrez l'application.
Le paquet .pkg est une autre méthode d'installation.

L'application n'est pas notarisée par Apple. Si macOS la bloque :
Réglages Système > Confidentialité et sécurité > Ouvrir quand même.

Vos véhicules et sauvegardes sont stockés dans votre dossier utilisateur,
séparément de l'application. Remplacer l'application ne les efface pas.

https://github.com/jeremdevgit/jmeca
TXT

dmg="$stage/JMeca-$version-macOS-$architecture.dmg"
pkg="$stage/JMeca-$version-macOS-$architecture.pkg"
hdiutil create -volname "JMeca $version" -srcfolder "$stage/dmg" -format UDZO -fs HFS+ "$dmg"
pkgbuild --root "$stage/pkgroot" --install-location / --identifier fr.jmeca.garage --version "$version" "$pkg" >/dev/null

codesign --verify --deep --strict "$stage/pkgroot/Applications/JMeca.app"
pkgutil --payload-files "$pkg" | grep -q 'Applications/JMeca.app/Contents/Info.plist'
hdiutil imageinfo "$dmg" >/dev/null
hdiutil verify "$dmg" >/dev/null

mv -f "$dmg" "$pkg" "$out/"
(cd "$out" && shasum -a 256 "${dmg:t}" "${pkg:t}" > SHA256SUMS-macos.txt && shasum -a 256 -c SHA256SUMS-macos.txt)
print "Installateurs macOS : $out/${dmg:t} et $out/${pkg:t}"
